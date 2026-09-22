// server/scripts/checkExpiredSlots.js
require("dotenv").config();
const connectDB = require("../config/db");
const DarshanSlot = require("../models/DarshanSlot");
const Booking = require("../models/Booking");

const run = async () => {
  await connectDB();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const expiredSlots = await DarshanSlot.find({ date: { $lt: startOfToday } }).populate("temple", "templeName");

  for (const slot of expiredSlots) {
    const bookingCount = await Booking.countDocuments({ slot: slot._id });
    console.log(
      `${slot.temple.templeName} - ${slot.darshanName} - ${slot.date.toDateString()} - bookings: ${bookingCount} - ${
        bookingCount > 0 ? "DO NOT MOVE (has bookings)" : "safe to reschedule"
      }`
    );
  }
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});