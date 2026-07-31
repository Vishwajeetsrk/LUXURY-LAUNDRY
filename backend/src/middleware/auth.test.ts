import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";

const TEST_JWT_SECRET = "test-secret-for-unit-tests-only";

// Set the env var before importing auth module so JWT_SECRET is read correctly
process.env.JWT_SECRET = TEST_JWT_SECRET;

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

import { authenticate, type AuthRequest } from "./auth";

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
      TEST_JWT_SECRET
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
