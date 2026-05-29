import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";
import { hasPermission } from "../lib/permissions";

const router = Router();

// GET /api/wallet/me — get own wallet balance and history
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { walletBalance: true }
    });
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ balance: user?.walletBalance || 0, history: transactions });
  } catch (err) {
    console.error("Get wallet error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/wallet/admin/add — Admin route to add/deduct credits manually
router.post("/admin/adjust", authenticate, requirePermission("customers:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { userId, amount, type, description } = req.body;
    if (!userId || !amount || !type || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");

      const newBalance = type === "CREDIT" 
        ? user.walletBalance + Number(amount)
        : user.walletBalance - Number(amount);

      await tx.walletTransaction.create({
        data: {
          userId,
          amount: Number(amount),
          type,
          description
        }
      });

      return tx.user.update({
        where: { id: userId },
        data: { walletBalance: newBalance },
        select: { id: true, name: true, walletBalance: true }
      });
    });

    res.json(updatedUser);
  } catch (err: any) {
    console.error("Adjust wallet error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
