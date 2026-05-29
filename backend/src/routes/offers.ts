import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";

const router = Router();

// GET /api/offers — public route to fetch active offers
router.get("/", async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
    res.json({ data: offers });
  } catch (err) {
    console.error("Get offers error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/offers/admin — admin route to fetch all offers
router.get("/admin", authenticate, requirePermission("services:read"), async (req: AuthRequest, res: Response) => {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json({ data: offers });
  } catch (err) {
    console.error("Get admin offers error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/offers — admin only, create offer
router.post("/", authenticate, requirePermission("services:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { code, description, discountType, discountValue, minOrderValue, maxDiscount, isActive, usageLimit } = req.body;
    
    if (!code || discountValue === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const offer = await prisma.offer.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType: discountType || "PERCENTAGE",
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.status(201).json(offer);
  } catch (err: any) {
    console.error("Create offer error:", err);
    if (err.code === "P2002") {
      return res.status(400).json({ message: "Offer code already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/offers/:id — admin only
router.patch("/:id", authenticate, requirePermission("services:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { code, description, discountType, discountValue, minOrderValue, maxDiscount, isActive, usageLimit } = req.body;
    const offer = await prisma.offer.update({
      where: { id: req.params.id as string },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
        ...(minOrderValue !== undefined && { minOrderValue: Number(minOrderValue) }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? Number(maxDiscount) : null }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ? Number(usageLimit) : null }),
        ...(isActive !== undefined && { isActive })
      }
    });
    res.json(offer);
  } catch (err: any) {
    console.error("Update offer error:", err);
    if (err.code === "P2002") {
      return res.status(400).json({ message: "Offer code already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/offers/:id — admin only
router.delete("/:id", authenticate, requirePermission("services:write"), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.offer.delete({ where: { id: req.params.id as string } });
    res.json({ message: "Offer deleted" });
  } catch (err) {
    console.error("Delete offer error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
