const express = require("express");
const router = express.Router();
const { getUsers, getUserById, createOrganizer, updateUser, deleteUser } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, authorize("admin"), getUsers);
router.post("/organizers", protect, authorize("admin"), createOrganizer);
router.get("/:id", protect, authorize("admin"), getUserById);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
