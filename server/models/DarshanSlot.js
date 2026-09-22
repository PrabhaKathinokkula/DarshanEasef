const mongoose = require("mongoose");

const darshanSlotSchema = new mongoose.Schema(
  {
    darshanName: { type: String, required: true, trim: true },
    temple: { type: mongoose.Schema.Types.ObjectId, ref: "Temple", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    availableSeats: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    price: { type: Number, required: true },
    vipPrice: { type: Number, default: 0 },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["open", "closed", "full"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DarshanSlot", darshanSlotSchema);
