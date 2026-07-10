import User from "../models/User.js";
import Company from "../models/Company.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import { clearCsrfTokenCookie } from "../utils/csrfToken.js";
import asyncHandler from "express-async-handler";
import crypto from "crypto";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUserResponse'
 *       400:
 *         description: Invalid registration request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  const userNameExists = await User.findOne({ username });

  if (userExists || userNameExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const parts = email.split("@");
  if (parts.length !== 2 || !parts[1]) {
    res.status(400);
    throw new Error("Invalid email address.");
  }
  const emailDomain = parts[1].toLowerCase();
  const company = await Company.findOne({ domain: emailDomain });

  if (!company) {
    res.status(400);
    throw new Error(
      "No company is registered for your email domain. Please contact your administrator.",
    );
  }

  const user = await User.create({
    name,
    username,
    email,
    password,
    company: company._id,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      company: company._id,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

/**
 * @swagger
 * /api/auth/is-admin:
 *   get:
 *     summary: Check whether the current user is an admin
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Admin status returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminStatusResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const isUserAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({ isAdmin: user.isAdmin });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Sign in with an email or username
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *           examples:
 *             withEmail:
 *               summary: Authenticate with an email
 *               value:
 *                 email: jane@example.com
 *                 password: password123
 *             withUsername:
 *               summary: Authenticate with a username
 *               value:
 *                 username: janedoe
 *                 password: password123
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUserResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const user =
    (await User.findOne({ email })) || (await User.findOne({ username }));

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Sign out the current user
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: X-CSRF-Token
 *         schema:
 *           type: string
 *         required: false
 *         description: Required when a valid jwt cookie is present on the request.
 *     responses:
 *       200:
 *         description: User logged out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       403:
 *         description: Invalid CSRF token or request origin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  clearCsrfTokenCookie(res);
  res.status(200).json({ message: "User logged out" });
});

/**
 * @swagger
 * /api/auth/forgotpassword:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email queued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *               required: [success, message]
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Email delivery failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error("There is no user registered with that email address.");
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  const message = `
    You are receiving this email because you (or someone else) requested a password reset.

    Please click the link below to reset your password. This link will expire in 10 minutes:
    \n\n ${resetUrl}
    \n\nIf you did not request this, please ignore this email and your password will remain unchanged.
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email sending failed:", error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error("Email could not be sent. Please try again later.");
  }
});

/**
 * @swagger
 * /api/auth/resetpassword/{resettoken}:
 *   put:
 *     summary: Reset a password with a valid reset token
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: resettoken
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token delivered by email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *               required: [success, message]
 *       400:
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired password reset token.");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message:
      "Password reset successful. You can now log in with your new password.",
  });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  isUserAdmin,
  forgotPassword,
  resetPassword,
};
