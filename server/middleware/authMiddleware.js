import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { setCsrfTokenCookie } from "../utils/csrfToken.js";

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Ensure the payload key matches your generateToken utility (usually userId)
      req.user = await User.findById(decoded.userId).select("-password");

      if (req.user) {
        if (!req.cookies.csrfToken) {
          setCsrfTokenCookie(res);
        }

        return next();
      }
    } catch (error) {
      if (req.originalUrl !== "/api/users/me") {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }
  }

  if (req.originalUrl === "/api/users/me") {
    return next();
  }

  res.status(401);
  throw new Error("Not authorized, no token");
});

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.isAdmin ? "admin" : req.user?.role;

    if (userRole && allowedRoles.includes(userRole)) {
      return next();
    }

    res.status(403);
    throw new Error("Not authorized for this resource");
  };
};

// For strictly Admin-only routes
const admin = authorize("admin");

export { protect, authorize, admin };
