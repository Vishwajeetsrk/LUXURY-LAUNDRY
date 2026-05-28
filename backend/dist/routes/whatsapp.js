"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/logs", auth_1.authenticate, (0, auth_1.requirePermission)("whatsapp:read"), async (req, res) => {
    try {
        const logs = await prisma_1.default.whatsAppLog.findMany({
            take: 100,
            orderBy: { createdAt: "desc" },
        });
        res.json(logs);
    }
    catch (error) {
        console.error("WhatsApp logs error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
// DELETE /api/whatsapp/logs/:id — admin only
router.delete("/logs/:id", auth_1.authenticate, (0, auth_1.requirePermission)("settings:write"), async (req, res) => {
    try {
        await prisma_1.default.whatsAppLog.delete({ where: { id: req.params.id } });
        res.json({ message: "WhatsApp log deleted" });
    }
    catch (err) {
        console.error("Delete WhatsApp log error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=whatsapp.js.map