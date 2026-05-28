"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/content — public, get all content
router.get("/", async (req, res) => {
    try {
        const content = await prisma_1.default.content.findMany();
        res.json(content);
    }
    catch (err) {
        console.error("Get content error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// GET /api/content/settings — get site settings
router.get("/settings", async (req, res) => {
    try {
        const settings = await prisma_1.default.siteSettings.findMany();
        res.json(settings);
    }
    catch (err) {
        console.error("Get settings error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// PATCH /api/content/:key — admin update content or setting
router.patch("/:key", auth_1.authenticate, (0, auth_1.requirePermission)("content:write"), async (req, res) => {
    try {
        const key = req.params.key;
        const { value, type } = req.body;
        if (type === "setting") {
            await prisma_1.default.siteSettings.upsert({
                where: { key },
                update: { value },
                create: { key, value },
            });
        }
        else {
            await prisma_1.default.content.upsert({
                where: { key },
                update: { value },
                create: { key, value, type: type || "text" },
            });
        }
        res.json({ message: "Content updated", key, value });
    }
    catch (err) {
        console.error("Update content error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=content.js.map