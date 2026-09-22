const Booking = require("../models/Booking");
const DarshanSlot = require("../models/DarshanSlot");
const Temple = require("../models/Temple");

const generateBookingId = () => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const ts = Date.now().toString().slice(-5);
  return `DE-${ts}-${rand}`;
};

// @desc   Create booking (real booking logic)
// @route  POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { slotId, numberOfDevotees, darshanType } = req.body;

    if (!slotId || !numberOfDevotees) {
      return res.status(400).json({ message: "slotId and numberOfDevotees are required" });
    }

    const devoteeCount = Number(numberOfDevotees);
    if (!Number.isInteger(devoteeCount) || devoteeCount < 1) {
      return res.status(400).json({ message: "numberOfDevotees must be a positive integer" });
    }

    // 1. Check slot exists
    const slot = await DarshanSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Darshan slot not found" });
    }

    // 2. Check slot is available/open
    if (slot.status === "closed") {
      return res.status(400).json({ message: "This darshan slot is closed for booking" });
    }

    // 2b. Check slot date hasn't already passed
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (new Date(slot.date) < startOfToday) {
      return res.status(400).json({ message: "This darshan slot has already passed and can no longer be booked" });
    }

    // 3 & 4. Check requested devotees vs available seats
    if (devoteeCount > slot.availableSeats) {
      return res.status(400).json({
        message: `Only ${slot.availableSeats} seat(s) available for this slot`,
      });
    }

    // 5. Calculate total price
    const type = darshanType === "vip" ? "vip" : "normal";
    const unitPrice = type === "vip" ? slot.vipPrice || slot.price : slot.price;
    const totalAmount = unitPrice * devoteeCount;

    // 6 & 7. Create booking with unique ID
    let bookingId = generateBookingId();
    // ensure uniqueness (very unlikely collision, but check anyway)
    let existing = await Booking.findOne({ bookingId });
    while (existing) {
      bookingId = generateBookingId();
      existing = await Booking.findOne({ bookingId });
    }

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      temple: slot.temple,
      slot: slot._id,
      numberOfDevotees: devoteeCount,
      darshanType: type,
      totalAmount,
      bookingStatus: "confirmed",
    });

    // 8. Reduce available seats
    slot.availableSeats -= devoteeCount;
    if (slot.availableSeats <= 0) {
      slot.availableSeats = 0;
      slot.status = "full";
    }
    await slot.save();

    const populated = await Booking.findById(booking._id)
      .populate("temple", "templeName location image")
      .populate("slot");

    // 9. Return booking confirmation
    res.status(201).json({ booking: populated });
  } catch (err) {
    next(err);
  }
};

// @desc   Get logged-in user's bookings
// @route  GET /api/bookings/my
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("temple", "templeName location image")
      .populate("slot")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

// @desc   Get all bookings (admin) or organizer's temple bookings
// @route  GET /api/bookings
const getBookings = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === "organizer") {
      const temple = await Temple.findOne({ organizer: req.user._id });
      if (!temple) return res.status(200).json({ count: 0, bookings: [] });
      filter.temple = temple._id;
    }

    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .populate("temple", "templeName location")
      .populate("slot")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

// @desc   Get single booking
// @route  GET /api/bookings/:id
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("temple", "templeName location image")
      .populate("slot");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (req.user.role === "user" && String(booking.user._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ booking });
  } catch (err) {
    next(err);
  }
};

// @desc   Cancel booking (restores seats)
// @route  PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (req.user.role === "user" && String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    // 1. Change status to cancelled
    booking.bookingStatus = "cancelled";
    await booking.save();

    // 2. Restore booked seats
    const slot = await DarshanSlot.findById(booking.slot);
    if (slot) {
      slot.availableSeats = Math.min(slot.availableSeats + booking.numberOfDevotees, slot.totalSeats);
      if (slot.status === "full" && slot.availableSeats > 0) {
        slot.status = "open";
      }
      await slot.save();
    }

    res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getMyBookings, getBookings, getBookingById, cancelBooking };
