import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";

const router = Router();

// GET /api/content — public, get all content
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const content = await prisma.content.findMany();
    res.json(content);
  } catch (err) {
    console.error("Get content error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/content/settings — get site settings
router.get("/settings", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await prisma.siteSettings.findMany();
    res.json(settings);
  } catch (err) {
    console.error("Get settings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/content/:key — admin update content or setting
router.patch("/:key", authenticate, requirePermission("content:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const key = req.params.key as string;
    const { value, type } = req.body;

    if (type === "setting") {
      await prisma.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    } else {
      await prisma.content.upsert({
        where: { key },
        update: { value },
        create: { key, value, type: type || "text" },
      });
    }

    res.json({ message: "Content updated", key, value });
  } catch (err) {
    console.error("Update content error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
