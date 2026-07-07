import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";

const listNotifications = asyncHandler(async (req, res) => {
  const role = req.user?.isAdmin || req.user?.role === "admin" ? "admin" : "user";
  const limit = Math.min(Number.parseInt(req.query.limit || "30", 10), 100);

  const notifications = await Notification.find({
    $or: [
      { user: req.user._id },
      { audience: "all" },
      ...(role === "admin" ? [{ audience: "admin" }] : []),
    ],
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("incident", "incidentCode title status priority severity")
    .lean();

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  res.json({ notifications, unreadCount });
});

const acknowledgeNotification = asyncHandler(async (req, res) => {
  const { isRead = true } = req.body;

  const notification = await Notification.findOne({
    _id: req.params.id,
    $or: [{ user: req.user._id }, { audience: "all" }, { audience: "admin" }],
  });

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  notification.isRead = Boolean(isRead);
  notification.readAt = isRead ? new Date() : null;
  await notification.save();

  res.json(notification);
});

const acknowledgeAllNotifications = asyncHandler(async (req, res) => {
  const role = req.user?.isAdmin || req.user?.role === "admin" ? "admin" : "user";

  const query = {
    isRead: false,
    $or: [
      { user: req.user._id },
      { audience: "all" },
      ...(role === "admin" ? [{ audience: "admin" }] : []),
    ],
  };

  const result = await Notification.updateMany(query, {
    $set: { isRead: true, readAt: new Date() },
  });

  res.json({ acknowledged: result.modifiedCount });
});

export {
  acknowledgeAllNotifications,
  acknowledgeNotification,
  listNotifications,
};
