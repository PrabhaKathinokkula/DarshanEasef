const User = require("../models/User");
const Temple = require("../models/Temple");
const DarshanSlot = require("../models/DarshanSlot");
const Booking = require("../models/Booking");

// @desc   Admin dashboard statistics
// @route  GET /api/admin/dashboard
const getAdminDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalOrganizers, totalTemples, totalDarshans, totalBookings] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "organizer" }),
      Temple.countDocuments(),
      DarshanSlot.countDocuments(),
      Booking.countDocuments(),
    ]);

    res.status(200).json({
      totalUsers,
      totalOrganizers,
      totalTemples,
      totalDarshans,
      totalBookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Organizer dashboard statistics
// @route  GET /api/organizer/dashboard
const getOrganizerDashboard = async (req, res, next) => {
  try {
    const temple = await Temple.findOne({ organizer: req.user._id });

    if (!temple) {
      return res.status(200).json({ temples: 0, darshans: 0, totalBookings: 0 });
    }

    const [darshans, totalBookings] = await Promise.all([
      DarshanSlot.countDocuments({ temple: temple._id }),
      Booking.countDocuments({ temple: temple._id }),
    ]);

    res.status(200).json({ temples: 1, darshans, totalBookings });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAdminDashboard, getOrganizerDashboard };
