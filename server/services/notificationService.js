import Notification from "../models/Notification.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

const createNotification = async ({
  io,
  userId = null,
  incidentId = null,
  audience = "user",
  type,
  title,
  message,
  metadata = {},
  channels = { inApp: true, email: false, slack: false, webhook: false },
}) => {
  const notification = await Notification.create({
    user: userId,
    incident: incidentId,
    audience,
    type,
    title,
    message,
    metadata,
    channels,
  });

  const payload = {
    _id: notification._id,
    audience,
    user: userId,
    incident: incidentId,
    type,
    title,
    message,
    metadata,
    isRead: false,
    createdAt: notification.createdAt,
  };

  if (io) {
    if (userId) {
      io.to(userId.toString()).emit("notification:new", payload);
    } else if (audience === "admin") {
      io.to("role:admin").emit("notification:new", payload);
    } else {
      io.emit("notification:new", payload);
    }
  }

  if (channels.email && userId) {
    const user = await User.findById(userId).select("email name");
    if (user?.email) {
      try {
        await sendEmail({
          email: user.email,
          subject: title,
          message: `${message}\n\nTicket Stream notification type: ${type}`,
        });
      } catch (error) {
        console.error("Notification email failed:", error.message);
      }
    }
  }

  if (channels.slack && process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `*${title}*\n${message}` }),
      });
    } catch (error) {
      console.error(
        `Slack notification failed for '${type}' (${title}): ${error.message}`,
      );
    }
  }

  return notification;
};

export { createNotification };
