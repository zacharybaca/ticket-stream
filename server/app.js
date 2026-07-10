import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import swaggerSpec from "./swagger.js";
import { CSRF_HEADER_NAME, setCsrfTokenHeader } from "./utils/csrfToken.js";

const app = express();
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Authentication endpoints must remain reachable without an existing valid
// session so that users with stale JWT cookies (but no matching CSRF token)
// are never permanently locked out of logging in or registering.
const CSRF_EXEMPT_PATHS = new Set(["/api/auth/login", "/api/auth/register"]);

const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean),
  credentials: true,
  exposedHeaders: [CSRF_HEADER_NAME],
};

const trustedOrigins = new Set(corsOptions.origin);

const isTrustedOrigin = (req, requestOrigin) => {
  if (!requestOrigin) {
    return false;
  }

  const requestHost = req.get("host");
  const sameOrigin = requestHost && requestOrigin === `${req.protocol}://${requestHost}`;

  return Boolean(sameOrigin || trustedOrigins.has(requestOrigin));
};

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
  if (!req.cookies?.jwt || !unsafeMethods.has(req.method) || CSRF_EXEMPT_PATHS.has(req.path)) {
    return next();
  }

  const requestOrigin = getRequestOrigin(req);
  const csrfHeader = req.get("x-csrf-token");
  const csrfCookie = req.cookies.csrfToken;

  // If a legacy/stale auth cookie exists without a CSRF token cookie, clear it to avoid locking users out.
  if (!csrfCookie) {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(403);
    return res.json({
      message: "Forbidden: missing CSRF token; please sign in again",
    });
  }

  if (isTrustedOrigin(req, requestOrigin) && csrfHeader && csrfHeader === csrfCookie) {
    return next();
  }

  res.status(403);
  return res.json({
    message: "Forbidden: invalid CSRF token or request origin",
  });
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
app.use((req, res, next) => {
  if (req.cookies?.csrfToken) {
    setCsrfTokenHeader(res, req.cookies.csrfToken);
  }

  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(csrfProtection);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling
app.use(errorHandler);

export default app;
