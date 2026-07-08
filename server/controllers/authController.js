import User from "../models/User.js";
import Company from "../models/Company.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import asyncHandler from "express-async-handler";
import crypto from "crypto";

const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  const userNameExists = await User.findOne({ username });

  if (userExists || userNameExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const emailDomain = email.split("@")[1]?.toLowerCase();
  const company = await Company.findOne({ domain: emailDomain });

  if (!company) {
    res.status(400);
    throw new Error(
      "No company is registered for your email domain. Please contact your administrator.",
    );
  }

  const user = await User.create({ name, username, email, password, company: company._id });

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

const isUserAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({ isAdmin: user.isAdmin });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

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

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User logged out" });
});

// @desc    Forgot password — sends a reset link via email
// @route   POST /api/auth/forgotpassword
// @access  Public
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

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
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
