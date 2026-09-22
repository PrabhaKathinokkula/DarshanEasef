const express = require("express");
const router = express.Router();
const {
  getTemples,
  getTempleById,
  getMyTemple,
  assignTempleToOrganizer,
  createTemple,
  updateTemple,
  deleteTemple,
} = require("../controllers/templeController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", getTemples);
router.get("/organizer/mine", protect, authorize("organizer"), getMyTemple);
router.post("/assign", protect, authorize("admin"), assignTempleToOrganizer);
router.get("/:id", getTempleById);
router.post("/", protect, authorize("organizer", "admin"), upload.single("image"), createTemple);
router.put("/:id", protect, authorize("organizer", "admin"), upload.single("image"), updateTemple);
router.delete("/:id", protect, authorize("admin"), deleteTemple);

module.exports = router;
