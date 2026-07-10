import { describe, expect, it, vi } from "vitest";
import {
  CSRF_HEADER_NAME,
  clearCsrfTokenCookie,
  setCsrfTokenCookie,
} from "../utils/csrfToken.js";

describe("csrf token helpers", () => {
  it("sets both the csrf cookie and response header", () => {
    const res = {
      cookie: vi.fn(),
      set: vi.fn(),
    };

    const token = setCsrfTokenCookie(res, "cross-origin-token");

    expect(token).toBe("cross-origin-token");
    expect(res.cookie).toHaveBeenCalledWith(
      "csrfToken",
      "cross-origin-token",
      expect.objectContaining({
        httpOnly: false,
      }),
    );
    expect(res.set).toHaveBeenCalledWith(CSRF_HEADER_NAME, "cross-origin-token");
  });

  it("clears both the csrf cookie and response header", () => {
    const res = {
      cookie: vi.fn(),
      set: vi.fn(),
    };

    clearCsrfTokenCookie(res);

    expect(res.cookie).toHaveBeenCalledWith(
      "csrfToken",
      "",
      expect.objectContaining({
        maxAge: 0,
      }),
    );
    expect(res.set).toHaveBeenCalledWith(CSRF_HEADER_NAME, "");
  });
});
