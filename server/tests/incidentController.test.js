import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../models/Incident.js", () => ({
  default: {
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

import Incident from "../models/Incident.js";
import { listIncidents } from "../controllers/incidentController.js";

describe("listIncidents", () => {
  let req;
  let res;
  let skipMock;
  let limitMock;

  beforeEach(() => {
    skipMock = vi.fn().mockReturnThis();
    limitMock = vi.fn().mockResolvedValue([]);

    const queryBuilder = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: skipMock,
      limit: limitMock,
    };

    Incident.find.mockReturnValue(queryBuilder);
    Incident.countDocuments.mockResolvedValue(0);

    req = { query: {}, user: { _id: "user-1" } };
    res = { json: vi.fn() };
  });

  it("escapes search terms before building regex filters", async () => {
    req.query.search = "[";

    await listIncidents(req, res, vi.fn());
    const filters = Incident.find.mock.calls[0][0];
    expect(filters.$or).toBeDefined();
    expect(filters.$or[0].title).toBeInstanceOf(RegExp);
    expect(filters.$or[0].title.source).toBe("\\[");
  });

  it("falls back to safe pagination defaults and caps limit", async () => {
    req.query.page = "0";
    req.query.limit = "999";

    await listIncidents(req, res, vi.fn());
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(100);
    expect(res.json).toHaveBeenCalledWith({
      incidents: [],
      pagination: {
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 0,
      },
    });
  });
});
