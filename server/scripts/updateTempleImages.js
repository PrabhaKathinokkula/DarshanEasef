// server/scripts/updateTempleImages.js
require("dotenv").config();
const connectDB = require("../config/db");
const Temple = require("../models/Temple");

const updates = [
  { templeName: "Tirumala Tirupati", image: "/images/temples/tirumala.jpg" },
  { templeName: "Srisailam", image: "/images/temples/srisailam.jpg" },
  { templeName: "Kashi Vishwanath", image: "/images/temples/kashi-vishwanath.jpg" },
];

const run = async () => {
  await connectDB();
  for (const u of updates) {
    const res = await Temple.updateOne({ templeName: u.templeName }, { $set: { image: u.image } });
    console.log(`${u.templeName}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});