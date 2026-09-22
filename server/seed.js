require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

const User = require("./models/User");
const Temple = require("./models/Temple");
const DarshanSlot = require("./models/DarshanSlot");
const Booking = require("./models/Booking");
const Feedback = require("./models/Feedback");

const seed = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Temple.deleteMany({}),
    DarshanSlot.deleteMany({}),
    Booking.deleteMany({}),
    Feedback.deleteMany({}),
  ]);

  const salt = await bcrypt.genSalt(10);

  console.log("Creating demo users...");
  const admin = await User.create({
    name: "Admin",
    email: "admin@darshanease.com",
    password: await bcrypt.hash("Admin@123", salt),
    phone: "9999999999",
    address: "Head Office",
    role: "admin",
  });

  const organizer1 = await User.create({
    name: "Tirumala Organizer",
    email: "organizer@darshanease.com",
    password: await bcrypt.hash("Organizer@123", salt),
    phone: "9888888888",
    address: "Tirupati, Andhra Pradesh",
    role: "organizer",
  });

  const organizer2 = await User.create({
    name: "Srisailam Organizer",
    email: "organizer.srisailam@darshanease.com",
    password: await bcrypt.hash("Organizer@123", salt),
    phone: "9888888801",
    address: "Srisailam, Andhra Pradesh",
    role: "organizer",
  });

  const organizer3 = await User.create({
    name: "Kashi Organizer",
    email: "organizer.kashi@darshanease.com",
    password: await bcrypt.hash("Organizer@123", salt),
    phone: "9888888802",
    address: "Varanasi, Uttar Pradesh",
    role: "organizer",
  });

  const user = await User.create({
    name: "Demo Devotee",
    email: "user@darshanease.com",
    password: await bcrypt.hash("User@123", salt),
    phone: "9777777777",
    address: "Hyderabad, Telangana",
    role: "user",
  });

  console.log("Creating demo temples...");
  const tirumala = await Temple.create({
    templeName: "Tirumala Tirupati",
    location: "TTD Administrative Building, K.T. Road, Tirupati, 517501, Andhra Pradesh, India",
    description:
      "Tirumala is a spiritual town in Tirupati district of the Indian state of Andhra Pradesh. It is one of the suburbs of the Tirupati urban agglomeration and home to the sacred Sri Venkateswara Temple.",
    darshanStartTime: "00:32 AM",
    darshanEndTime: "21:32 PM",
    organizer: organizer1._id,
  });

  const srisailam = await Temple.create({
    templeName: "Srisailam",
    location: "Srisailam, Nandyal District, Andhra Pradesh, India",
    description:
      "Srisailam is home to the Bhramaramba Mallikarjuna Swamy Temple, one of the twelve Jyotirlinga shrines of Lord Shiva, set amid the Nallamala forest hills.",
    darshanStartTime: "04:00 AM",
    darshanEndTime: "09:00 PM",
    organizer: organizer2._id,
  });

  const kashi = await Temple.create({
    templeName: "Kashi Vishwanath",
    location: "Lahori Tola, Varanasi, Domari, Uttar Pradesh 221001",
    description:
      "Kashi Vishwanath Temple is a Hindu temple dedicated to Shiva. It is located in Vishwanath Gali, Varanasi, Uttar Pradesh, India. The temple is a Hindu pilgrimage site and one of the twelve Jyotirlingas.",
    darshanStartTime: "03:00 AM",
    darshanEndTime: "11:00 PM",
    organizer: organizer3._id,
  });

  console.log("Creating demo darshan slots...");
  const today = new Date();
  const inDays = (n) => new Date(today.getTime() + n * 24 * 60 * 60 * 1000);

  await DarshanSlot.create([
    {
      darshanName: "Seeghra Darshanam",
      temple: tirumala._id,
      date: inDays(1),
      startTime: "06:00 AM",
      endTime: "06:00 PM",
      totalSeats: 300,
      availableSeats: 300,
      price: 300,
      vipPrice: 500,
      description:
        "The Special Entry Darshan(Seeghra Darshanam) is introduced on 01-Jan-2024 to provide quick Darshan to the Pilgrims.",
    },
    {
      darshanName: "Sarva Darshan",
      temple: tirumala._id,
      date: inDays(1),
      startTime: "09:00 AM",
      endTime: "04:00 PM",
      totalSeats: 500,
      availableSeats: 500,
      price: 0,
      vipPrice: 200,
      description: "This is a general darshan in which devotees can have a glimpse of the Lord's deity free of cost.",
    },
    {
      darshanName: "Divya Darshan",
      temple: tirumala._id,
      date: inDays(2),
      startTime: "10:00 AM",
      endTime: "04:00 PM",
      totalSeats: 200,
      availableSeats: 200,
      price: 100,
      vipPrice: 0,
      description: "Divya Darshan is specially made for people who are coming by walk.",
    },
    {
      darshanName: "Mallikarjuna Darshan",
      temple: srisailam._id,
      date: inDays(1),
      startTime: "05:00 AM",
      endTime: "08:00 PM",
      totalSeats: 250,
      availableSeats: 250,
      price: 150,
      vipPrice: 350,
      description: "Special darshan of Bhramaramba Mallikarjuna Swamy.",
    },
    {
      darshanName: "Vishwanath Darshan",
      temple: kashi._id,
      date: inDays(1),
      startTime: "03:00 AM",
      endTime: "11:00 PM",
      totalSeats: 400,
      availableSeats: 400,
      price: 200,
      vipPrice: 500,
      description: "Sparsh darshan of Lord Vishwanath.",
    },
  ]);

  console.log("Seed data created successfully!");
  console.log("----------------------------------------");
  console.log("Demo credentials:");
  console.log("Admin:      admin@darshanease.com / Admin@123");
  console.log("Organizer:  organizer@darshanease.com / Organizer@123");
  console.log("User:       user@darshanease.com / User@123");
  console.log("----------------------------------------");

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
