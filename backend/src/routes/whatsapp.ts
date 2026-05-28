import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";

const router = Router();

router.get("/logs", authenticate, requirePermission("whatsapp:read"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.whatsAppLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });
    res.json(logs);
  } catch (error) {
    console.error("WhatsApp logs error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/whatsapp/logs/:id — admin only
router.delete("/logs/:id", authenticate, requirePermission("settings:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.whatsAppLog.delete({ where: { id: req.params.id as string } });
    res.json({ message: "WhatsApp log deleted" });
  } catch (err) {
    console.error("Delete WhatsApp log error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
