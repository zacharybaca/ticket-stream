import { describe, expect, it, vi } from "vitest";
import {
  CSRF_HEADER_NAME,
  clearCsrfTokenCookie,
  setCsrfTokenCookie,
  syncCsrfTokenHeader,
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

  it("syncs the csrf header for api requests with a csrf cookie", () => {
    const req = {
      path: "/api/incidents",
      cookies: { csrfToken: "cookie-token" },
    };
    const res = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    };
    const next = vi.fn();

    syncCsrfTokenHeader(req, res, next);

    expect(res.set).toHaveBeenCalledWith(CSRF_HEADER_NAME, "cookie-token");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("skips header sync when the request is not eligible", () => {
    const next = vi.fn();

    syncCsrfTokenHeader(
      { path: "/health", cookies: { csrfToken: "cookie-token" } },
      {
        get: vi.fn().mockReturnValue(undefined),
        set: vi.fn(),
      },
      next,
    );

    syncCsrfTokenHeader(
      { path: "/api/incidents", cookies: {} },
      {
        get: vi.fn().mockReturnValue(undefined),
        set: vi.fn(),
      },
      next,
    );

    const resWithHeader = {
      get: vi.fn().mockReturnValue("existing-token"),
      set: vi.fn(),
    };

    syncCsrfTokenHeader(
      { path: "/api/incidents", cookies: { csrfToken: "cookie-token" } },
      resWithHeader,
      next,
    );

    expect(resWithHeader.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(3);
  });
});
