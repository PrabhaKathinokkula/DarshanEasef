const mongoose = require("mongoose");

// Tracks a Razorpay order from creation through verification.
// A Booking is only created (and seats only reserved) once the
// corresponding Payment here has been verified as "paid".
const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: "DarshanSlot", required: true },
    temple: { type: mongoose.Schema.Types.ObjectId, ref: "Temple", required: true },
    numberOfDevotees: { type: Number, required: true, min: 1 },
    darshanType: { type: String, enum: ["normal", "vip"], default: "normal" },
    amount: { type: Number, required: true }, // in paise (smallest currency unit)
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    failureReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
