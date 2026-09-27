const crypto = require("crypto");
const Razorpay = require("razorpay");
const Booking = require("../models/Booking");
const DarshanSlot = require("../models/DarshanSlot");
const Payment = require("../models/Payment");

// Lazily create the Razorpay instance so a missing .env key gives a clear
// error at request time instead of crashing the whole server on boot.
let razorpayInstance = null;
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const err = new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env"
    );
    err.statusCode = 500;
    throw err;
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

// Same booking-id format used by the existing booking flow
// (server/controllers/bookingController.js) so tickets/IDs look identical
// regardless of which path created the booking.
const generateBookingId = () => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const ts = Date.now().toString().slice(-5);
  return `DE-${ts}-${rand}`;
};

// @desc   Validate the requested booking, calculate the amount from the
//         existing slot pricing (never trust a client-supplied amount),
//         and create a Razorpay order for it. No Booking/seat changes yet.
// @route  POST /api/payments/create-order
const createOrder = async (req, res, next) => {
  try {
    const { slotId, numberOfDevotees, darshanType } = req.body;

    if (!slotId || !numberOfDevotees) {
      return res.status(400).json({ message: "slotId and numberOfDevotees are required" });
    }

    const devoteeCount = Number(numberOfDevotees);
    if (!Number.isInteger(devoteeCount) || devoteeCount < 1) {
      return res.status(400).json({ message: "numberOfDevotees must be a positive integer" });
    }

    const slot = await DarshanSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Darshan slot not found" });
    }

    if (slot.status === "closed") {
      return res.status(400).json({ message: "This darshan slot is closed for booking" });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (new Date(slot.date) < startOfToday) {
      return res.status(400).json({ message: "This darshan slot has already passed and can no longer be booked" });
    }

    if (devoteeCount > slot.availableSeats) {
      return res.status(400).json({
        message: `Only ${slot.availableSeats} seat(s) available for this slot`,
      });
    }

    // Amount is calculated here, from the existing slot pricing, and never
    // taken from the request body.
    const type = darshanType === "vip" ? "vip" : "normal";
    const unitPrice = type === "vip" ? slot.vipPrice || slot.price : slot.price;
    const totalAmount = unitPrice * devoteeCount;
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${req.user._id}`,
      notes: {
        slotId: String(slot._id),
        userId: String(req.user._id),
        numberOfDevotees: String(devoteeCount),
        darshanType: type,
      },
    });

    await Payment.create({
      user: req.user._id,
      slot: slot._id,
      temple: slot.temple,
      numberOfDevotees: devoteeCount,
      darshanType: type,
      amount: amountInPaise,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created",
    });

    res.status(201).json({
      orderId: order.id,
      amount: amountInPaise,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      totalAmount,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Verify a Razorpay payment signature and, only if valid, create the
//         real booking using the existing booking rules (seat checks,
//         seat decrement, booking id format, etc).
// @route  POST /api/payments/verify
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification details" });
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ message: "Payment order not found" });
    }

    if (String(payment.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Idempotency: if this order was already verified/booked (e.g. the
    // checkout handler fired twice, or the user retried), return the
    // existing booking instead of creating a duplicate one.
    if (payment.status === "paid" && payment.booking) {
      const existing = await Booking.findById(payment.booking)
        .populate("temple", "templeName location image")
        .populate("slot");
      return res.status(200).json({ booking: existing });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      payment.status = "failed";
      payment.failureReason = "Signature verification failed";
      payment.razorpayPaymentId = razorpay_payment_id;
      await payment.save();
      return res.status(400).json({ message: "Payment verification failed. Please try again." });
    }

    // Signature is valid — re-check the slot exactly like the existing
    // booking flow does, in case seats changed while payment was in progress.
    const slot = await DarshanSlot.findById(payment.slot);
    if (!slot) {
      payment.status = "failed";
      payment.failureReason = "Darshan slot no longer exists";
      await payment.save();
      return res.status(404).json({ message: "Darshan slot not found" });
    }

    if (slot.status === "closed") {
      payment.status = "failed";
      payment.failureReason = "Slot closed before booking could be confirmed";
      await payment.save();
      return res.status(400).json({ message: "This darshan slot is closed for booking" });
    }

    if (payment.numberOfDevotees > slot.availableSeats) {
      payment.status = "failed";
      payment.failureReason = "Seats no longer available";
      await payment.save();
      return res.status(409).json({
        message: "Your payment succeeded but seats for this slot are no longer available. Please contact support for a refund.",
      });
    }

    let bookingId = generateBookingId();
    let existingBooking = await Booking.findOne({ bookingId });
    while (existingBooking) {
      bookingId = generateBookingId();
      existingBooking = await Booking.findOne({ bookingId });
    }

    const totalAmount = payment.amount / 100;

    const booking = await Booking.create({
      bookingId,
      user: payment.user,
      temple: payment.temple,
      slot: slot._id,
      numberOfDevotees: payment.numberOfDevotees,
      darshanType: payment.darshanType,
      totalAmount,
      bookingStatus: "confirmed",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    // Same seat-decrement logic as the existing booking flow.
    slot.availableSeats -= payment.numberOfDevotees;
    if (slot.availableSeats <= 0) {
      slot.availableSeats = 0;
      slot.status = "full";
    }
    await slot.save();

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.booking = booking._id;
    await payment.save();

    const populated = await Booking.findById(booking._id)
      .populate("temple", "templeName location image")
      .populate("slot");

    res.status(200).json({ booking: populated });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, verifyPayment };
