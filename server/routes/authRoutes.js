import express from "express";
import {
  getRegistrationCompanies,
  loginUser,
  registerUser,
  logoutUser,
  isUserAdmin,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/registration-companies", getRegistrationCompanies);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/is-admin", protect, isUserAdmin); // Route to check if the user is an admin
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

export default router;
