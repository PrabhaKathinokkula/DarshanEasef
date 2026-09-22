const express = require("express");
const router = express.Router();
const { getAdminDashboard, getOrganizerDashboard } = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/admin/dashboard", protect, authorize("admin"), getAdminDashboard);
router.get("/organizer/dashboard", protect, authorize("organizer"), getOrganizerDashboard);

module.exports = router;
