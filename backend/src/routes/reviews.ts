import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";

const router = Router();

// GET /api/reviews - public (only published reviews)
router.get("/", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isPublished: true },
      include: {
        customer: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });
    res.json(reviews);
  } catch (err) {
    console.error("Get public reviews error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reviews/admin - admin only (all reviews)
router.get("/admin", authenticate, requirePermission("reviews:read"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        customer: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(reviews);
  } catch (err) {
    console.error("Get all reviews error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/reviews - authenticated customer
router.post("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    const review = await prisma.review.create({
      data: {
        customerId: req.user!.id,
        rating: Number(rating),
        comment: comment || null,
        isPublished: false // Requires admin approval
      },
      include: {
        customer: { select: { name: true } }
      }
    });

    res.status(201).json(review);
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/reviews/:id - admin only (toggle publish status)
router.patch("/:id", authenticate, requirePermission("reviews:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isPublished } = req.body;
    
    if (isPublished === undefined) {
      res.status(400).json({ message: "isPublished is required" });
      return;
    }

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { isPublished }
    });

    res.json(review);
  } catch (err) {
    console.error("Update review error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/reviews/:id - admin only
router.delete("/:id", authenticate, requirePermission("reviews:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.review.delete({
      where: { id: req.params.id }
    });
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
