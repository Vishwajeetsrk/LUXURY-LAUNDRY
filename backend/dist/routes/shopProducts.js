"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/shop-products — public
router.get("/", async (req, res) => {
    try {
        const showAll = req.query.all === "true";
        const where = showAll ? {} : { isActive: true };
        const products = await prisma_1.default.shopProduct.findMany({
            where,
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        });
        res.json(products);
    }
    catch (err) {
        console.error("Get shop products error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// POST /api/shop-products — admin only
router.post("/", auth_1.authenticate, (0, auth_1.requirePermission)("shop:write"), async (req, res) => {
    try {
        const { name, description, price, originalPrice, image, badge, badgeColor, category, unit, sortOrder } = req.body;
        if (!name || !description || price === undefined) {
            res.status(400).json({ message: "name, description, and price are required" });
            return;
        }
        const product = await prisma_1.default.shopProduct.create({
            data: {
                name,
                description,
                price: Number(price),
                originalPrice: originalPrice ? Number(originalPrice) : null,
                image: image || null,
                badge: badge || null,
                badgeColor: badgeColor || null,
                category: category || "general",
                unit: unit || "pack",
                sortOrder: sortOrder ? Number(sortOrder) : 0,
            },
        });
        res.status(201).json(product);
    }
    catch (err) {
        console.error("Create shop product error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// PATCH /api/shop-products/:id — admin only
router.patch("/:id", auth_1.authenticate, (0, auth_1.requirePermission)("shop:write"), async (req, res) => {
    try {
        const { name, description, price, originalPrice, image, badge, badgeColor, category, unit, isActive, sortOrder } = req.body;
        const data = {};
        if (name !== undefined)
            data.name = name;
        if (description !== undefined)
            data.description = description;
        if (price !== undefined)
            data.price = Number(price);
        if (originalPrice !== undefined)
            data.originalPrice = originalPrice ? Number(originalPrice) : null;
        if (image !== undefined)
            data.image = image;
        if (badge !== undefined)
            data.badge = badge || null;
        if (badgeColor !== undefined)
            data.badgeColor = badgeColor || null;
        if (category !== undefined)
            data.category = category;
        if (unit !== undefined)
            data.unit = unit;
        if (isActive !== undefined)
            data.isActive = isActive;
        if (sortOrder !== undefined)
            data.sortOrder = Number(sortOrder);
        const updated = await prisma_1.default.shopProduct.update({
            where: { id: req.params.id },
            data,
        });
        res.json(updated);
    }
    catch (err) {
        console.error("Update shop product error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// DELETE /api/shop-products/:id — admin only
router.delete("/:id", auth_1.authenticate, (0, auth_1.requirePermission)("shop:write"), async (req, res) => {
    try {
        await prisma_1.default.shopProduct.delete({ where: { id: req.params.id } });
        res.json({ message: "Product deleted" });
    }
    catch (err) {
        console.error("Delete shop product error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=shopProducts.js.map