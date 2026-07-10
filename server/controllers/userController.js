import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get the logged-in user's profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
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
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update the logged-in user's profile
 *     tags: [Users]
 *     parameters:
  *       - in: header
  *         name: X-CSRF-Token
  *         schema:
  *           type: string
  *         required: true
  *         description: Required for authenticated unsafe requests (must match the csrfToken cookie).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
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
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
  *             schema:
  *               allOf:
  *                 - $ref: '#/components/schemas/UserReference'
  *                 - type: object
  *                   properties:
  *                     avatar:
  *                       type: string
  *                       nullable: true
  *                     role:
  *                       type: string
  *                       enum: [admin, responder, observer]
  *                     isAdmin:
  *                       type: boolean
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
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name || user.name;
  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;

  if (req.body.password) {
    user.password = req.body.password;
  }

  if (req.file) {
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }
    user.avatar = req.file.path;
    user.avatarPublicId = req.file.filename;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    username: updatedUser.username,
    email: updatedUser.email,
    avatar: updatedUser.avatar,
    role: updatedUser.role,
    isAdmin: updatedUser.isAdmin,
  });
});

/**
 * @swagger
 * /api/users/profile:
 *   delete:
 *     summary: Delete the logged-in user's account
 *     tags: [Users]
 *     parameters:
 *       - in: header
 *         name: X-CSRF-Token
 *         schema:
 *           type: string
 *         required: false
 *         description: Required when a valid jwt cookie is present on the request.
 *     responses:
 *       200:
 *         description: User account deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
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
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.avatarPublicId) {
    await cloudinary.uploader.destroy(user.avatarPublicId);
  }

  await user.deleteOne();
  res.json({ message: "Account deleted successfully" });
});

export { getUserProfile, updateUserProfile, deleteUser };
