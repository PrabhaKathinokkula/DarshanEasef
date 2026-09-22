const mongoose = require("mongoose");

const templeSchema = new mongoose.Schema(
  {
    templeName: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    darshanStartTime: { type: String, default: "06:00 AM" },
    darshanEndTime: { type: String, default: "09:00 PM" },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Temple", templeSchema);
