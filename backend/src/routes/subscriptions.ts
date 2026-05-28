import { Router, Request, Response, RequestHandler } from "express";
import { body, param, validationResult } from "express-validator";
import { authenticate, requirePermission } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();

// Validation middleware
const validate = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// @route   POST /api/subscriptions
// @desc    Request a new subscription package
// @access  Private
const createSubscription: RequestHandler = async (req, res) => {
  try {
    const { plan, price } = req.body;
    const userId = (req as any).user!.id;
    
    // Create request
    const request = await prisma.subscriptionRequest.create({
      data: {
        userId,
        plan,
        price: parseFloat(price),
        status: "PENDING"
      },
      include: {
        user: {
          select: { name: true, phone: true, email: true }
        }
      }
    });

    // Build WhatsApp message
    const message = `Hi Admin, I would like to subscribe to the ${plan} (${price}).\nMy details:\nName: ${request.user.name}\nPhone: ${request.user.phone || 'N/A'}\nEmail: ${request.user.email}\nPlease approve my request!`;
    const adminPhone = process.env.ADMIN_PHONE_NUMBER || "919663574728";
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${adminPhone}?text=${encodedMessage}`;

    res.status(201).json({ 
      message: "Subscription request created successfully",
      whatsappLink,
      request
    });
  } catch (err: any) {
    console.error("Error creating subscription:", err);
    res.status(500).json({ message: "Server error" });
  }
};

router.post("/", authenticate, [
  body("plan").isString().notEmpty(),
  body("price").isNumeric()
], validate, createSubscription);

// @route   GET /api/subscriptions
// @desc    Get all subscription requests
// @access  Admin
const getSubscriptions: RequestHandler = async (req, res) => {
  try {
    const requests = await prisma.subscriptionRequest.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(requests);
  } catch (err: any) {
    console.error("Error fetching subscriptions:", err);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/", authenticate, requirePermission("subscriptions:read") as any, getSubscriptions);

// @route   PATCH /api/subscriptions/:id
// @desc    Approve or reject a subscription request
// @access  Admin
const updateSubscription: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // "APPROVED" or "REJECTED"

    const currentRequest = await prisma.subscriptionRequest.findUnique({ where: { id } });
    if (!currentRequest) {
      res.status(404).json({ message: "Request not found" });
      return;
    }

    if (currentRequest.status !== "PENDING") {
      res.status(400).json({ message: "Request has already been processed" });
      return;
    }

    const updatedRequest = await prisma.subscriptionRequest.update({
      where: { id },
      data: { status }
    });

    if (status === "APPROVED") {
      let discountPercentage = 0;
      if (currentRequest.plan === "SILVER PACKAGE") discountPercentage = 20;
      if (currentRequest.plan === "GOLD PACKAGE") discountPercentage = 25;
      if (currentRequest.plan === "PREMIUM PACKAGE") discountPercentage = 30;

      await prisma.user.update({
        where: { id: currentRequest.userId },
        data: {
          subscriptionPlan: currentRequest.plan,
          discountPercentage
        }
      });
    }

    res.json(updatedRequest);
  } catch (err: any) {
    console.error("Error updating subscription:", err);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:id", authenticate, requirePermission("subscriptions:write") as any, [
  body("status").isIn(["APPROVED", "REJECTED"])
], validate, updateSubscription);

export default router;
