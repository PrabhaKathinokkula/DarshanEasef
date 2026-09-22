const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("user"), createBooking);
router.get("/my", protect, authorize("user"), getMyBookings);
router.get("/", protect, authorize("organizer", "admin"), getBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;
