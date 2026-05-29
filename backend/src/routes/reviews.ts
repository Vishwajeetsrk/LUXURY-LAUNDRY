import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";

const router = Router();

// GET /api/reviews — public route to fetch published reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isPublished: true },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    res.json({ data: reviews });
  } catch (err) {
    console.error("Get reviews error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reviews/admin — admin route to fetch all reviews
router.get("/admin", authenticate, requirePermission("services:read"), async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      include: { customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json({ data: reviews });
  } catch (err) {
    console.error("Get admin reviews error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/reviews — customer creates a review
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const customerId = req.user!.id;
    
    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }
    
    const review = await prisma.review.create({
      data: {
        customerId,
        rating: Number(rating),
        comment,
        isPublished: false // Admin must approve
      }
    });
    res.status(201).json({ message: "Review submitted successfully", data: review });
  } catch (err: any) {
    console.error("Create review error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/reviews/:id/publish — admin approves/publishes review
router.patch("/:id/publish", authenticate, requirePermission("services:write"), async (req: AuthRequest, res: Response) => {
  try {
    const { isPublished } = req.body;
    const review = await prisma.review.update({
      where: { id: req.params.id as string },
      data: { isPublished }
    });
    res.json(review);
  } catch (err: any) {
    console.error("Publish review error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/reviews/:id — admin only
router.delete("/:id", authenticate, requirePermission("services:write"), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id as string } });
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export const reviewsRoutes = router;
