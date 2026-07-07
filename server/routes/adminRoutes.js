import express from "express";
import { listUsers, updateUserRole } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

router.use(protect, authorize("admin:users:update"));

router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);

export default router;
