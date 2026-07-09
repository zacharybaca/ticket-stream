import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

let app;

beforeAll(async () => {
  process.env.CLIENT_URL = "http://localhost:5173";
  ({ default: app } = await import("../app.js"));
});

describe("csrf protection", () => {
  it("rejects unsafe cookie-authenticated requests from untrusted origins", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", ["jwt=test-token"]);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "Forbidden: invalid request origin",
    });
  });

  it("allows unsafe cookie-authenticated requests from trusted origins", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Origin", "http://localhost:5173")
      .set("Cookie", ["jwt=test-token"]);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "User logged out" });
  });
});
