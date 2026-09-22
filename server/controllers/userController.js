const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const Temple = require("../models/Temple");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const toSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  role: user.role,
  isActive: user.isActive !== false,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getUsers = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: admin only" });
    }

    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ count: users.length, users: users.map(toSafeUser) });
  } catch (err) {
    return next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: admin only" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user: toSafeUser(user) });
  } catch (err) {
    if (err && err.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    return next(err);
  }
};

const createOrganizer = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: admin only" });
    }

    const { name, email, password, phone, address, templeId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      return res.status(400).json({ message: "Please enter a valid 10-digit mobile number." });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    let temple;
    if (templeId) {
      temple = await Temple.findById(templeId);
      if (!temple) {
        return res.status(404).json({ message: "Temple not found" });
      }
      const assignedOrganizer = mongoose.isValidObjectId(temple.organizer)
        ? await User.findOne({ _id: temple.organizer, role: "organizer" })
        : null;
      if (assignedOrganizer) {
        return res.status(400).json({ message: "This temple is already assigned to another organizer." });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const organizer = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      address: address || "",
      role: "organizer",
      isActive: true,
    });

    if (temple) {
      temple.organizer = organizer._id;
      await temple.save();
    }

    return res.status(201).json({
      message: "Organizer account created successfully",
      user: toSafeUser(organizer),
    });
  } catch (err) {
    return next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: admin only" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, phone, address, role, isActive, password, templeId } = req.body;

    if (String(req.user._id) === String(user._id)) {
      if (role !== undefined || isActive !== undefined) {
        return res.status(400).json({ message: "You cannot change your own admin role or account status." });
      }
    }

    if (name !== undefined && name.trim() !== "") {
      user.name = name.trim();
    }

    if (email !== undefined) {
      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address." });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      user.email = email.toLowerCase();
    }

    if (phone !== undefined) {
      if (phone && !PHONE_REGEX.test(phone)) {
        return res.status(400).json({ message: "Please enter a valid 10-digit mobile number." });
      }
      user.phone = phone || "";
    }

    if (address !== undefined) {
      user.address = address || "";
    }

    if (role !== undefined) {
      if (role === "admin") {
        return res.status(400).json({ message: "Admin role cannot be assigned from this screen." });
      }
      if (!["user", "organizer"].includes(role)) {
        return res.status(400).json({ message: "Role can only be updated to user or organizer." });
      }
      user.role = role;
    }

    if (isActive !== undefined) {
      if (String(req.user._id) === String(user._id) && !isActive) {
        return res.status(400).json({ message: "You cannot disable your own admin account." });
      }
      user.isActive = Boolean(isActive);
    }

    if (password) {
      if (!PASSWORD_REGEX.test(password)) {
        return res.status(400).json({
          message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (templeId !== undefined) {
      if (user.role !== "organizer") {
        return res.status(400).json({ message: "Only organizers can be assigned a temple." });
      }

      const temple = await Temple.findById(templeId);
      if (!temple) {
        return res.status(404).json({ message: "Temple not found" });
      }

      const assignedOrganizer = mongoose.isValidObjectId(temple.organizer)
        ? await User.findOne({ _id: temple.organizer, role: "organizer" })
        : null;

      if (assignedOrganizer && String(assignedOrganizer._id) !== String(user._id)) {
        return res.status(400).json({ message: "This temple is already assigned to another organizer." });
      }

      const currentTemple = await Temple.findOne({ organizer: user._id });
      if (currentTemple && String(currentTemple._id) !== String(temple._id)) {
        return res.status(400).json({ message: "This organizer already has a temple assigned." });
      }

      temple.organizer = user._id;
      await temple.save();
    }

    await user.save();
    return res.status(200).json({ message: "User updated successfully", user: toSafeUser(user) });
  } catch (err) {
    if (err && err.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    return next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: admin only" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(req.user._id) === String(user._id)) {
      return res.status(400).json({ message: "You cannot delete your own admin account." });
    }

    await user.deleteOne();
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    if (err && err.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    return next(err);
  }
};

module.exports = { getUsers, getUserById, createOrganizer, updateUser, deleteUser };
