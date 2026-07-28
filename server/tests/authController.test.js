import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../models/User.js", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../models/Company.js", () => ({
  default: {
    findById: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("../utils/generateToken.js", () => ({
  default: vi.fn(),
}));

vi.mock("../utils/sendEmail.js", () => ({
  default: vi.fn(),
}));

vi.mock("../utils/csrfToken.js", () => ({
  clearCsrfTokenCookie: vi.fn(),
  setCsrfTokenCookie: vi.fn(),
}));

import User from "../models/User.js";
import Company from "../models/Company.js";
import { registerUser } from "../controllers/authController.js";

const VALID_COMPANY_ID = "000000000000000000000001";

describe("registerUser", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    User.findOne.mockResolvedValue(null);
    Company.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    req = {
      body: {
        name: "Test User",
        username: "testuser",
        email: "test@acme.com",
        password: "password123",
        companyId: VALID_COMPANY_ID,
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    };

    next = vi.fn();
  });

  it("returns 400 when companyId is missing", async () => {
    req.body.companyId = undefined;

    await registerUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe("Company selection is required.");
  });

  it("returns 400 when email is invalid", async () => {
    req.body.email = "not-an-email";

    await registerUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe("Invalid email address.");
  });

  it("returns 400 when companyId is not a valid ObjectId format", async () => {
    req.body.companyId = "not-an-object-id";

    await registerUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe("Invalid company selection.");
  });

  it("returns 400 when companyId is not found in the database", async () => {
    Company.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    await registerUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe("Selected company does not exist.");
  });

  it("returns 400 when email domain does not match the company domain", async () => {
    Company.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue({ _id: VALID_COMPANY_ID, domain: "other.com" }),
    });

    await registerUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe(
      "Email domain must match the selected company's domain.",
    );
  });

  it("returns 201 with user data on successful registration", async () => {
    const company = { _id: VALID_COMPANY_ID, domain: "acme.com" };
    Company.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue(company),
    });

    const user = {
      _id: "user-1",
      username: "testuser",
      email: "test@acme.com",
      name: "Test User",
    };
    User.create.mockResolvedValue(user);

    await registerUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      company: company._id,
    });
  });
});
