"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/services — public
router.get("/", async (req, res) => {
    try {
        const services = await prisma_1.default.service.findMany({ orderBy: { createdAt: "asc" } });
        res.json(services);
    }
    catch (err) {
        console.error("Get services error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// POST /api/services — admin only
router.post("/", auth_1.authenticate, (0, auth_1.requirePermission)("services:write"), async (req, res) => {
    try {
        const { name, description, pricePerUnit, unit, imageUrl } = req.body;
        if (!name || !description || pricePerUnit === undefined || !unit) {
            res.status(400).json({ message: "name, description, pricePerUnit, and unit are required" });
            return;
        }
        const service = await prisma_1.default.service.create({
            data: { name, description, pricePerUnit: Number(pricePerUnit), unit, imageUrl: imageUrl || null },
        });
        res.status(201).json(service);
    }
    catch (err) {
        console.error("Create service error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// PATCH /api/services/:id — admin only
router.patch("/:id", auth_1.authenticate, (0, auth_1.requirePermission)("services:write"), async (req, res) => {
    try {
        const { name, description, pricePerUnit, unit, imageUrl, isActive } = req.body;
        const data = {};
        if (name !== undefined)
            data.name = name;
        if (description !== undefined)
            data.description = description;
        if (pricePerUnit !== undefined)
            data.pricePerUnit = Number(pricePerUnit);
        if (unit !== undefined)
            data.unit = unit;
        if (imageUrl !== undefined)
            data.imageUrl = imageUrl;
        if (isActive !== undefined)
            data.isActive = isActive;
        const updated = await prisma_1.default.service.update({ where: { id: req.params.id }, data });
        res.json(updated);
    }
    catch (err) {
        console.error("Update service error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// DELETE /api/services/:id — admin only
router.delete("/:id", auth_1.authenticate, (0, auth_1.requirePermission)("services:write"), async (req, res) => {
    try {
        await prisma_1.default.service.delete({ where: { id: req.params.id } });
        res.json({ message: "Service deleted" });
    }
    catch (err) {
        console.error("Delete service error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=services.js.map