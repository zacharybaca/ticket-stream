import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean),
  credentials: true,
};

const trustedOrigins = new Set(corsOptions.origin);

const getRequestOrigin = (req) => {
  const originHeader = req.get("origin");

  if (originHeader) {
    return originHeader;
  }

  const refererHeader = req.get("referer");

  if (!refererHeader) {
    return null;
  }

  try {
    return new URL(refererHeader).origin;
  } catch {
    return null;
  }
};

const csrfProtection = (req, res, next) => {
  if (!req.cookies?.jwt || !unsafeMethods.has(req.method)) {
    return next();
  }

  const requestOrigin = getRequestOrigin(req);
  const csrfHeader = req.get("x-csrf-token");
  const csrfCookie = req.cookies.csrfToken;

  if (
    requestOrigin &&
    trustedOrigins.has(requestOrigin) &&
    csrfHeader &&
    csrfCookie &&
    csrfHeader === csrfCookie
  ) {
    return next();
  }

  res.status(403);
  return res.json({ message: "Forbidden: invalid CSRF token or request origin" });
};

// Security headers
app.use(helmet());

// Request logging (skip in test environment)
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// General API rate limiter — 100 req / 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

// Stricter auth limiter — 20 req / 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts, please try again later.",
  },
});
app.use("/api/auth", authLimiter);

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser()); // Must come before routes to parse JWT cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(csrfProtection);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/companies", companyRoutes);

// Error handling
app.use(errorHandler);

export default app;
