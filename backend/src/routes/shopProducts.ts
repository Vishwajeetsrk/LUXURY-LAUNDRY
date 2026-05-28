import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";

const router = Router();

// GET /api/shop-products — public
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const showAll = req.query.all === "true";
    const where = showAll ? {} : { isActive: true };
    const products = await prisma.shopProduct.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    res.json(products);
  } catch (err) {
    console.error("Get shop products error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/shop-products — admin only
router.post("/", authenticate, requirePermission("shop:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, originalPrice, image, badge, badgeColor, category, unit, sortOrder } = req.body;
    if (!name || !description || price === undefined) {
      res.status(400).json({ message: "name, description, and price are required" });
      return;
    }
    const product = await prisma.shopProduct.create({
      data: {
        name,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        image: image || null,
        badge: badge || null,
        badgeColor: badgeColor || null,
        category: category || "general",
        unit: unit || "pack",
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error("Create shop product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/shop-products/:id — admin only
router.patch("/:id", authenticate, requirePermission("shop:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, originalPrice, image, badge, badgeColor, category, unit, isActive, sortOrder } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = Number(price);
    if (originalPrice !== undefined) data.originalPrice = originalPrice ? Number(originalPrice) : null;
    if (image !== undefined) data.image = image;
    if (badge !== undefined) data.badge = badge || null;
    if (badgeColor !== undefined) data.badgeColor = badgeColor || null;
    if (category !== undefined) data.category = category;
    if (unit !== undefined) data.unit = unit;
    if (isActive !== undefined) data.isActive = isActive;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);

    const updated = await prisma.shopProduct.update({
      where: { id: req.params.id as string },
      data,
    });
    res.json(updated);
  } catch (err) {
    console.error("Update shop product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/shop-products/:id — admin only
router.delete("/:id", authenticate, requirePermission("shop:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.shopProduct.delete({ where: { id: req.params.id as string } });
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Delete shop product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
