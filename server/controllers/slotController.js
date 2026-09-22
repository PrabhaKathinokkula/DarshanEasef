const DarshanSlot = require("../models/DarshanSlot");
const Temple = require("../models/Temple");

// @desc   Get all slots (optionally filter by temple)
// @route  GET /api/slots
const getSlots = async (req, res, next) => {
  try {
    const { temple, includeExpired } = req.query;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const filter = temple ? { temple } : {};
    // Hide past-dated slots from the public listing unless explicitly requested
    if (!includeExpired) {
      filter.date = { $gte: startOfToday };
    }

    const slots = await DarshanSlot.find(filter).populate("temple", "templeName location").sort({ date: 1 });
    res.status(200).json({ count: slots.length, slots });
  } catch (err) {
    next(err);
  }
};
// @desc   Get slots for the logged-in organizer's temple
// @route  GET /api/slots/organizer/mine
const getMySlots = async (req, res, next) => {
  try {
    const temple = await Temple.findOne({ organizer: req.user._id });
    if (!temple) return res.status(200).json({ count: 0, slots: [] });

    const slots = await DarshanSlot.find({ temple: temple._id }).sort({ date: 1 });
    res.status(200).json({ count: slots.length, slots });
  } catch (err) {
    next(err);
  }
};

// @desc   Get single slot
// @route  GET /api/slots/:id
const getSlotById = async (req, res, next) => {
  try {
    const slot = await DarshanSlot.findById(req.params.id).populate("temple", "templeName location");
    if (!slot) return res.status(404).json({ message: "Darshan slot not found" });
    res.status(200).json({ slot });
  } catch (err) {
    next(err);
  }
};

// @desc   Create slot (organizer/admin)
// @route  POST /api/slots
const createSlot = async (req, res, next) => {
  try {
    const { darshanName, temple, date, startTime, endTime, totalSeats, price, vipPrice, description } = req.body;

    if (!darshanName || !temple || !date || !startTime || !endTime || !totalSeats || price === undefined) {
      return res.status(400).json({ message: "Missing required darshan slot fields" });
    }

    const templeDoc = await Temple.findById(temple);
    if (!templeDoc) return res.status(404).json({ message: "Temple not found" });

    if (req.user.role === "organizer" && String(templeDoc.organizer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only create darshans for your own temple" });
    }

    const slot = await DarshanSlot.create({
      darshanName,
      temple,
      date,
      startTime,
      endTime,
      totalSeats,
      availableSeats: totalSeats,
      price,
      vipPrice: vipPrice || 0,
      description,
    });

    res.status(201).json({ slot });
  } catch (err) {
    next(err);
  }
};

// @desc   Update slot
// @route  PUT /api/slots/:id
const updateSlot = async (req, res, next) => {
  try {
    const slot = await DarshanSlot.findById(req.params.id).populate("temple");
    if (!slot) return res.status(404).json({ message: "Darshan slot not found" });

    if (req.user.role === "organizer" && String(slot.temple.organizer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only update your own temple's darshans" });
    }

    const { darshanName, date, startTime, endTime, totalSeats, price, vipPrice, description, status } = req.body;

    if (darshanName) slot.darshanName = darshanName;
    if (date) slot.date = date;
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    if (price !== undefined) slot.price = price;
    if (vipPrice !== undefined) slot.vipPrice = vipPrice;
    if (description !== undefined) slot.description = description;
    if (status) slot.status = status;

    if (totalSeats !== undefined) {
      const bookedSeats = slot.totalSeats - slot.availableSeats;
      slot.totalSeats = totalSeats;
      slot.availableSeats = Math.max(totalSeats - bookedSeats, 0);
    }

    await slot.save();
    res.status(200).json({ slot });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete slot
// @route  DELETE /api/slots/:id
const deleteSlot = async (req, res, next) => {
  try {
    const slot = await DarshanSlot.findById(req.params.id).populate("temple");
    if (!slot) return res.status(404).json({ message: "Darshan slot not found" });

    if (req.user.role === "organizer" && String(slot.temple.organizer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own temple's darshans" });
    }

    await slot.deleteOne();
    res.status(200).json({ message: "Darshan slot deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSlots, getMySlots, getSlotById, createSlot, updateSlot, deleteSlot };
