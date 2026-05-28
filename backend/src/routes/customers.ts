import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";
import { canAssignRole } from "../lib/permissions";

const router = Router();

// GET /api/customers — admin only
router.get("/", authenticate, requirePermission("customers:read"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, _count: { select: { orders: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count()
    ]);
    
    res.json({
      data: customers,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error("Get customers error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/customers/:id
router.get("/:id", authenticate, requirePermission("customers:read"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, orders: { include: { service: { select: { name: true } } }, orderBy: { createdAt: "desc" } } },
    });
    if (!customer) { res.status(404).json({ message: "Customer not found" }); return; }
    res.json(customer);
  } catch (err) {
    console.error("Get customer error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/customers/:id
router.patch("/:id", authenticate, requirePermission("customers:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, role } = req.body;
    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (role) {
      if (!canAssignRole(req.user!.role, role)) {
        res.status(403).json({ message: "You cannot assign this role" });
        return;
      }
      data.role = role;
    }
    const updated = await prisma.user.update({ where: { id: req.params.id as string }, data, select: { id: true, name: true, email: true, phone: true, role: true } });
    res.json(updated);
  } catch (err) {
    console.error("Update customer error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// PUT /api/customers/me/addresses
router.put("/me/addresses", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { addresses } = req.body;
    if (!addresses || !Array.isArray(addresses)) {
      res.status(400).json({ message: "Invalid addresses format. Expected an array." });
      return;
    }
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { addresses },
      select: { id: true, addresses: true }
    });
    res.json(updated.addresses);
  } catch (err) {
    console.error("Update addresses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/customers/:id — admin only
router.delete("/:id", authenticate, requirePermission("customers:delete"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Soft-delete: check if user has orders
    const orderCount = await prisma.order.count({ where: { customerId: req.params.id as string } });
    if (orderCount > 0) {
      // Soft delete by updating deletedAt
      await prisma.user.update({ where: { id: req.params.id as string }, data: { deletedAt: new Date() } });
    } else {
      await prisma.user.delete({ where: { id: req.params.id as string } });
    }
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error("Delete customer error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
