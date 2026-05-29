import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticate, type AuthRequest } from "./auth";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
}));

vi.mock("../lib/prisma", () => ({
  default: {
    user: {
      findUnique: mocks.findUnique,
    },
  },
}));

function createResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as any;
}

describe("authenticate", () => {
  beforeEach(() => {
    mocks.findUnique.mockReset();
  });

  it("uses the current database role instead of a stale token role", async () => {
    const token = jwt.sign(
      { id: "user-1", email: "owner@example.com", role: "ADMIN", name: "Owner" },
      "luxwash-secret-key-2024"
    );
    mocks.findUnique.mockResolvedValue({
      id: "user-1",
      email: "owner@example.com",
      role: "CUSTOMER",
      name: "Owner",
      deletedAt: null,
    });
    const req = {
      cookies: {},
      headers: { authorization: `Bearer ${token}` },
    } as AuthRequest;
    const res = createResponse();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toEqual({
      id: "user-1",
      email: "owner@example.com",
      role: "CUSTOMER",
      name: "Owner",
    });
  });
});
