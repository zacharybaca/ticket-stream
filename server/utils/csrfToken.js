import crypto from "crypto";

const csrfCookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const setCsrfTokenCookie = (
  res,
  csrfToken = crypto.randomBytes(32).toString("hex"),
) => {
  res.cookie("csrfToken", csrfToken, csrfCookieOptions);
  return csrfToken;
};

const clearCsrfTokenCookie = (res) => {
  res.cookie("csrfToken", "", {
    ...csrfCookieOptions,
    expires: new Date(0),
    maxAge: 0,
  });
};

export { setCsrfTokenCookie, clearCsrfTokenCookie };
