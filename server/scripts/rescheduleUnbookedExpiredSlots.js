// server/scripts/rescheduleUnbookedExpiredSlots.js
require("dotenv").config();
const connectDB = require("../config/db");
const DarshanSlot = require("../models/DarshanSlot");
const Booking = require("../models/Booking");

const run = async () => {
  await connectDB();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const expiredSlots = await DarshanSlot.find({ date: { $lt: startOfToday } });

  for (const slot of expiredSlots) {
    const bookingCount = await Booking.countDocuments({ slot: slot._id });
    if (bookingCount === 0) {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 3); // 3 days from now
      await DarshanSlot.updateOne({ _id: slot._id }, { $set: { date: newDate } });
      console.log(`Rescheduled "${slot.darshanName}" to ${newDate.toDateString()}`);
    }
  }
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});