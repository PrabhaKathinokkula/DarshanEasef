const Feedback = require("../models/Feedback");

// @desc   Submit feedback
// @route  POST /api/feedback
const createFeedback = async (req, res, next) => {
  try {
    const { temple, rating, comment } = req.body;

    if (!temple || !rating) {
      return res.status(400).json({ message: "Temple and rating are required" });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      temple,
      rating,
      comment,
    });

    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
};

// @desc   Get feedback for a temple
// @route  GET /api/feedback/temple/:templeId
const getTempleFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ temple: req.params.templeId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const avgRating =
      feedback.length > 0
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
        : 0;

    res.status(200).json({ count: feedback.length, avgRating, feedback });
  } catch (err) {
    next(err);
  }
};

module.exports = { createFeedback, getTempleFeedback };
