const mongoose = require("mongoose");
const Temple = require("../models/Temple");
const User = require("../models/User");
const DarshanSlot = require("../models/DarshanSlot");
const Booking = require("../models/Booking");

// @desc   Get all temples (public, supports search)
// @route  GET /api/temples
const getTemples = async (req, res, next) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
      filter = {
        $or: [
          { templeName: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      };
    }

    const temples = await Temple.find(filter)
      .populate("organizer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: temples.length, temples });
  } catch (err) {
    next(err);
  }
};

// @desc   Get single temple
// @route  GET /api/temples/:id
const getTempleById = async (req, res, next) => {
  try {
    const temple = await Temple.findById(req.params.id).populate("organizer", "name email");
    if (!temple) return res.status(404).json({ message: "Temple not found" });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const slots = await DarshanSlot.find({
      temple: temple._id,
      date: { $gte: startOfToday },
    }).sort({ date: 1 });

    res.status(200).json({ temple, slots });
  } catch (err) {
    next(err);
  }
};

// @desc   Get temple owned by logged-in organizer
// @route  GET /api/temples/organizer/mine
const getMyTemple = async (req, res, next) => {
  try {
    const temple = await Temple.findOne({ organizer: req.user._id });
    if (!temple) return res.status(404).json({ message: "No temple assigned to this organizer yet" });
    res.status(200).json({ temple });
  } catch (err) {
    next(err);
  }
};

// @desc   Assign an existing temple to an organizer (admin only)
// @route  POST /api/temples/assign
const assignTempleToOrganizer = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: admin only" });
    }

    const { organizerId, templeId } = req.body;

    if (!organizerId || !templeId) {
      return res.status(400).json({ message: "Organizer and temple are required" });
    }

    const organizer = await User.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    if (organizer.role !== "organizer") {
      return res.status(400).json({ message: "Selected user is not an organizer" });
    }

    const temple = await Temple.findById(templeId);
    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    const organizerAssignedTemple = await Temple.findOne({ organizer: organizer._id });
    if (organizerAssignedTemple && String(organizerAssignedTemple._id) !== String(temple._id)) {
      return res.status(400).json({ message: "This organizer already has a temple assigned." });
    }

    const assignedOrganizer = mongoose.isValidObjectId(temple.organizer)
      ? await User.findOne({ _id: temple.organizer, role: "organizer" })
      : null;

    if (assignedOrganizer && String(assignedOrganizer._id) !== String(organizer._id)) {
      return res.status(400).json({ message: "This temple is already assigned to another organizer." });
    }

    temple.organizer = organizer._id;
    await temple.save();

    res.status(200).json({ message: "Temple assigned successfully", temple });
  } catch (err) {
    if (err && err.name === "CastError") {
      return res.status(400).json({ message: "Invalid organizer or temple ID" });
    }
    return next(err);
  }
};

// @desc   Create temple (admin, or organizer creating their own)
// @route  POST /api/temples
const createTemple = async (req, res, next) => {
  try {
    const { templeName, location, description, darshanStartTime, darshanEndTime, organizer } = req.body;

    if (!templeName || !location) {
      return res.status(400).json({ message: "Temple name and location are required" });
    }

    // let organizerId = req.user._id;
    // if (req.user.role === "admin" && organizer) {
    //   organizerId = organizer;
    // }
    let organizerId = req.user._id;

if (req.user.role === "admin") {
  if (!organizer) {
    return res.status(400).json({ message: "Please select an organizer" });
  }

  const User = require("../models/User");
  const organizerUser = await User.findOne({
    _id: organizer,
    role: "organizer",
  });

  if (!organizerUser) {
    return res.status(400).json({ message: "Invalid organizer selected" });
  }

  organizerId = organizerUser._id;
}

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const temple = await Temple.create({
      templeName,
      location,
      description,
      darshanStartTime,
      darshanEndTime,
      organizer: organizerId,
      image,
    });

    res.status(201).json({ temple });
  } catch (err) {
    next(err);
  }
};

// @desc   Update temple
// @route  PUT /api/temples/:id
const updateTemple = async (req, res, next) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple) return res.status(404).json({ message: "Temple not found" });

    if (req.user.role === "organizer" && String(temple.organizer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only update your own temple" });
    }

    const { templeName, location, description, darshanStartTime, darshanEndTime } = req.body;
    if (templeName) temple.templeName = templeName;
    if (location) temple.location = location;
    if (description !== undefined) temple.description = description;
    if (darshanStartTime) temple.darshanStartTime = darshanStartTime;
    if (darshanEndTime) temple.darshanEndTime = darshanEndTime;

    if (req.file) {
      temple.image = `/uploads/${req.file.filename}`;
    }

    await temple.save();
    res.status(200).json({ temple });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete temple (admin only)
// @route  DELETE /api/temples/:id
const deleteTemple = async (req, res, next) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple) return res.status(404).json({ message: "Temple not found" });

    await DarshanSlot.deleteMany({ temple: temple._id });
    await temple.deleteOne();

    res.status(200).json({ message: "Temple deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTemples,
  getTempleById,
  getMyTemple,
  assignTempleToOrganizer,
  createTemple,
  updateTemple,
  deleteTemple,
};
