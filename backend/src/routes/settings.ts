import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";

const router = Router();

// GET /api/settings/:key
router.get("/:key", async (req, res) => {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: req.params.key }
    });
    res.json({ value: setting?.value || null });
  } catch (err) {
    console.error("Get setting error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/settings
router.get("/", async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findMany();
    const result = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(result);
  } catch (err) {
    console.error("Get settings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/settings (admin only)
router.post("/", authenticate, requirePermission("settings:write"), async (req: AuthRequest, res: Response) => {
  try {
    const updates = Object.entries(req.body).map(async ([key, value]) => {
      return prisma.siteSettings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    });
    await Promise.all(updates);
    res.json({ message: "Settings updated successfully" });
  } catch (err) {
    console.error("Update settings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
