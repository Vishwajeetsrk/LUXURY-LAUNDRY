"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// Validation middleware
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
// @route   POST /api/subscriptions
// @desc    Request a new subscription package
// @access  Private
const createSubscription = async (req, res) => {
    try {
        const { plan, price } = req.body;
        const userId = req.user.id;
        // Create request
        const request = await prisma_1.default.subscriptionRequest.create({
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
    }
    catch (err) {
        console.error("Error creating subscription:", err);
        res.status(500).json({ message: "Server error" });
    }
};
router.post("/", auth_1.authenticate, [
    (0, express_validator_1.body)("plan").isString().notEmpty(),
    (0, express_validator_1.body)("price").isNumeric()
], validate, createSubscription);
// @route   GET /api/subscriptions
// @desc    Get all subscription requests
// @access  Admin
const getSubscriptions = async (req, res) => {
    try {
        const requests = await prisma_1.default.subscriptionRequest.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json(requests);
    }
    catch (err) {
        console.error("Error fetching subscriptions:", err);
        res.status(500).json({ message: "Server error" });
    }
};
router.get("/", auth_1.authenticate, (0, auth_1.requirePermission)("subscriptions:read"), getSubscriptions);
// @route   PATCH /api/subscriptions/:id
// @desc    Approve or reject a subscription request
// @access  Admin
const updateSubscription = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body; // "APPROVED" or "REJECTED"
        const currentRequest = await prisma_1.default.subscriptionRequest.findUnique({ where: { id } });
        if (!currentRequest) {
            res.status(404).json({ message: "Request not found" });
            return;
        }
        if (currentRequest.status !== "PENDING") {
            res.status(400).json({ message: "Request has already been processed" });
            return;
        }
        const updatedRequest = await prisma_1.default.subscriptionRequest.update({
            where: { id },
            data: { status }
        });
        if (status === "APPROVED") {
            let discountPercentage = 0;
            if (currentRequest.plan === "SILVER PACKAGE")
                discountPercentage = 20;
            if (currentRequest.plan === "GOLD PACKAGE")
                discountPercentage = 25;
            if (currentRequest.plan === "PREMIUM PACKAGE")
                discountPercentage = 30;
            await prisma_1.default.user.update({
                where: { id: currentRequest.userId },
                data: {
                    subscriptionPlan: currentRequest.plan,
                    discountPercentage
                }
            });
        }
        res.json(updatedRequest);
    }
    catch (err) {
        console.error("Error updating subscription:", err);
        res.status(500).json({ message: "Server error" });
    }
};
router.patch("/:id", auth_1.authenticate, (0, auth_1.requirePermission)("subscriptions:write"), [
    (0, express_validator_1.body)("status").isIn(["APPROVED", "REJECTED"])
], validate, updateSubscription);
exports.default = router;
//# sourceMappingURL=subscriptions.js.map