import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, requireRoles } from "../middleware/auth";

const router = Router();

// GET all price list items (public)
router.get("/", async (req, res: Response) => {
  try {
    const items = await prisma.priceListItem.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(items);
  } catch (error) {
    console.error("Error fetching price list:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST new price list item (Admin only)
router.post("/", authenticate, requireRoles(["SUPER_ADMIN"]), async (req: any, res: Response) => {
  try {
    const { category, name, dryCleanPrice, steamIronPrice, price, image, isActive, sortOrder } = req.body;
    
    const newItem = await prisma.priceListItem.create({
      data: {
        category,
        name,
        dryCleanPrice,
        steamIronPrice,
        price,
        image,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      }
    });
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating price list item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update price list item (Admin only)
router.put("/:id", authenticate, requireRoles(["SUPER_ADMIN"]), async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { category, name, dryCleanPrice, steamIronPrice, price, image, isActive, sortOrder } = req.body;
    
    const updatedItem = await prisma.priceListItem.update({
      where: { id },
      data: {
        category,
        name,
        dryCleanPrice,
        steamIronPrice,
        price,
        image,
        isActive,
        sortOrder,
      }
    });
    
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating price list item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE price list item (Admin only)
router.delete("/:id", authenticate, requireRoles(["SUPER_ADMIN"]), async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.priceListItem.delete({ where: { id } });
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting price list item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
