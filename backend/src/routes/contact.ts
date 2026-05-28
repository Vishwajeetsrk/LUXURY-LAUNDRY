import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";

const router = Router();

// POST /api/contact — public form submission
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      res.status(400).json({ message: "name, email, subject, and message are required" });
      return;
    }
    const submission = await prisma.contactSubmission.create({
      data: { name, email, phone: phone || null, subject, message },
    });
    res.status(201).json({ message: "Message sent successfully", id: submission.id });
  } catch (err) {
    console.error("Contact error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/contact — admin sees all submissions
router.get("/", authenticate, requirePermission("contacts:read"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(submissions);
  } catch (err) {
    console.error("Get contacts error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/contact/:id — admin only
router.delete("/:id", authenticate, requirePermission("contacts:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.contactSubmission.delete({ where: { id: req.params.id as string } });
    res.json({ message: "Contact inquiry deleted" });
  } catch (err) {
    console.error("Delete contact error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
