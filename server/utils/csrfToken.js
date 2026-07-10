import crypto from "crypto";

const CSRF_HEADER_NAME = "X-CSRF-Token";

const csrfCookieOptions = {
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

export {
  CSRF_HEADER_NAME,
  setCsrfTokenCookie,
  clearCsrfTokenCookie,
  setCsrfTokenHeader,
};
