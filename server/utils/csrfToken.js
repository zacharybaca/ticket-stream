import crypto from "crypto";

const CSRF_HEADER_NAME = "X-CSRF-Token";

const csrfCookieOptions = {
  // The CSRF token must stay readable by the client so it can be echoed back in
  // the header for cross-origin authenticated writes.
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const setCsrfTokenHeader = (res, csrfToken = "") => {
  res.set(CSRF_HEADER_NAME, csrfToken);
};

const setCsrfTokenCookie = (
  res,
  csrfToken = crypto.randomBytes(32).toString("hex"),
) => {
  res.cookie("csrfToken", csrfToken, csrfCookieOptions);
  setCsrfTokenHeader(res, csrfToken);
  return csrfToken;
};

const clearCsrfTokenCookie = (res) => {
  res.cookie("csrfToken", "", {
    ...csrfCookieOptions,
    expires: new Date(0),
    maxAge: 0,
  });
  setCsrfTokenHeader(res);
};

const syncCsrfTokenHeader = (req, res, next) => {
  if (
    req.path.startsWith("/api") &&
    req.cookies?.csrfToken &&
    !res.get(CSRF_HEADER_NAME)
  ) {
    // Keep the latest token mirrored in a response header so cross-origin
    // clients can refresh sessionStorage without re-reading cookies.
    setCsrfTokenHeader(res, req.cookies.csrfToken);
  }

  next();
};

export {
  CSRF_HEADER_NAME,
  setCsrfTokenCookie,
  clearCsrfTokenCookie,
  setCsrfTokenHeader,
  syncCsrfTokenHeader,
};
