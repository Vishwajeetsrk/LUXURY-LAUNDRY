import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";

const router = Router();

// GET /api/services — public
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({ orderBy: { createdAt: "asc" } });
    res.json(services);
  } catch (err) {
    console.error("Get services error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/services — admin only
router.post("/", authenticate, requirePermission("services:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, pricePerUnit, originalPrice, unit, imageUrl } = req.body;
    if (!name || !description || pricePerUnit === undefined || !unit) {
      res.status(400).json({ message: "name, description, pricePerUnit, and unit are required" });
      return;
    }
    const service = await prisma.service.create({
      data: { 
        name, 
        description, 
        pricePerUnit: Number(pricePerUnit), 
        originalPrice: originalPrice ? Number(originalPrice) : null,
        unit, 
        imageUrl: imageUrl || null 
      },
    });
    res.status(201).json(service);
  } catch (err) {
    console.error("Create service error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/services/:id — admin only
router.patch("/:id", authenticate, requirePermission("services:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, pricePerUnit, originalPrice, unit, imageUrl, isActive } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (pricePerUnit !== undefined) data.pricePerUnit = Number(pricePerUnit);
    if (originalPrice !== undefined) data.originalPrice = originalPrice ? Number(originalPrice) : null;
    if (unit !== undefined) data.unit = unit;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (isActive !== undefined) data.isActive = isActive;
    const updated = await prisma.service.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) {
    console.error("Update service error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/services/:id — admin only
router.delete("/:id", authenticate, requirePermission("services:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.service.delete({ where: { id: req.params.id as string } });
    res.json({ message: "Service deleted" });
  } catch (err) {
    console.error("Delete service error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
