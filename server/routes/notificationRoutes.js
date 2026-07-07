import express from "express";
import {
  acknowledgeAllNotifications,
  acknowledgeNotification,
  listNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

router.use(protect, authorize("notification:read"));

router.get("/", listNotifications);
router.patch("/acknowledge-all", acknowledgeAllNotifications);
router.patch("/:id/acknowledge", acknowledgeNotification);

export default router;
