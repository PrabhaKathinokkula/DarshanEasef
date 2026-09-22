const express = require("express");
const router = express.Router();
const {
  getSlots,
  getMySlots,
  getSlotById,
  createSlot,
  updateSlot,
  deleteSlot,
} = require("../controllers/slotController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", getSlots);
router.get("/organizer/mine", protect, authorize("organizer"), getMySlots);
router.get("/:id", getSlotById);
router.post("/", protect, authorize("organizer", "admin"), createSlot);
router.put("/:id", protect, authorize("organizer", "admin"), updateSlot);
router.delete("/:id", protect, authorize("organizer", "admin"), deleteSlot);

module.exports = router;
