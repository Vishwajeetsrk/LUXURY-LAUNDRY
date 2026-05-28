"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/contact — public form submission
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            res.status(400).json({ message: "name, email, subject, and message are required" });
            return;
        }
        const submission = await prisma_1.default.contactSubmission.create({
            data: { name, email, phone: phone || null, subject, message },
        });
        res.status(201).json({ message: "Message sent successfully", id: submission.id });
    }
    catch (err) {
        console.error("Contact error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// GET /api/contact — admin sees all submissions
router.get("/", auth_1.authenticate, (0, auth_1.requirePermission)("contacts:read"), async (req, res) => {
    try {
        const submissions = await prisma_1.default.contactSubmission.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(submissions);
    }
    catch (err) {
        console.error("Get contacts error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// DELETE /api/contact/:id — admin only
router.delete("/:id", auth_1.authenticate, (0, auth_1.requirePermission)("contacts:write"), async (req, res) => {
    try {
        await prisma_1.default.contactSubmission.delete({ where: { id: req.params.id } });
        res.json({ message: "Contact inquiry deleted" });
    }
    catch (err) {
        console.error("Delete contact error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=contact.js.map