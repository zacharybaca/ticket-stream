import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";

const ALLOWED_ROLES = ["observer", "analyst", "manager", "admin"];

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({})
    .select("_id name username email role isAdmin createdAt")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ users });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!ALLOWED_ROLES.includes(role)) {
    res.status(400);
    throw new Error("Invalid role value");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const previousRole = user.role;
  user.role = role;
  user.isAdmin = role === "admin";
  const updatedUser = await user.save();

  await createNotification({
    io: req.app.get("io"),
    userId: updatedUser._id,
    audience: "user",
    type: "role-updated",
    title: "Your access role has changed",
    message: `${previousRole} → ${role}`,
    metadata: { previousRole, nextRole: role },
    channels: { inApp: true, email: false, slack: false, webhook: false },
  });

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    username: updatedUser.username,
    email: updatedUser.email,
    role: updatedUser.role,
    isAdmin: updatedUser.isAdmin,
  });
});

export { listUsers, updateUserRole, ALLOWED_ROLES };
