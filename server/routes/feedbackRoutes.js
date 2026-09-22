const express = require("express");
const router = express.Router();
const { createFeedback, getTempleFeedback } = require("../controllers/feedbackController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("user"), createFeedback);
router.get("/temple/:templeId", getTempleFeedback);

module.exports = router;
