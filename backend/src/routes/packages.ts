import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";
import { hasPermission } from "../lib/permissions";

const router = Router();

// GET /api/packages — public route to fetch active packages
router.get("/", async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" }
    });
    res.json({ data: packages });
  } catch (err) {
    console.error("Get packages error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/packages — admin only, create package
router.post("/", authenticate, requirePermission("services:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, walletCredits, discountPercentage, features, isActive } = req.body;
    if (!name || price === undefined || walletCredits === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const pkg = await prisma.package.create({
      data: {
        name,
        description,
        price: Number(price),
        walletCredits: Number(walletCredits),
        discountPercentage: Number(discountPercentage) || 0,
        features: features || [],
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.status(201).json(pkg);
  } catch (err) {
    console.error("Create package error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/packages/:id — admin only
router.patch("/:id", authenticate, requirePermission("services:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, walletCredits, discountPercentage, features, isActive } = req.body;
    const pkg = await prisma.package.update({
      where: { id: req.params.id as string },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(walletCredits !== undefined && { walletCredits: Number(walletCredits) }),
        ...(discountPercentage !== undefined && { discountPercentage: Number(discountPercentage) }),
        ...(features !== undefined && { features }),
        ...(isActive !== undefined && { isActive })
      }
    });
    res.json(pkg);
  } catch (err) {
    console.error("Update package error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/packages/:id — admin only
router.delete("/:id", authenticate, requirePermission("services:write"), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.package.delete({ where: { id: req.params.id as string } });
    res.json({ message: "Package deleted" });
  } catch (err) {
    console.error("Delete package error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
