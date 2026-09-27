const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    temple: { type: mongoose.Schema.Types.ObjectId, ref: "Temple", required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: "DarshanSlot", required: true },
    bookingDate: { type: Date, default: Date.now },
    numberOfDevotees: { type: Number, required: true, min: 1 },
    darshanType: { type: String, enum: ["normal", "vip"], default: "normal" },
    totalAmount: { type: Number, required: true },
    bookingStatus: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    // Payment fields (added for Razorpay integration). Optional/backward-
    // compatible: bookings created before this feature existed simply won't
    // have razorpay ids, and default to "paid" so they keep behaving as
    // already-confirmed, already-paid bookings.
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "paid",
    },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
