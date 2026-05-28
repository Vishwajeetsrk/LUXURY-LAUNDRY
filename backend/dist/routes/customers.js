"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const permissions_1 = require("../lib/permissions");
const router = (0, express_1.Router)();
// GET /api/customers — admin only
router.get("/", auth_1.authenticate, (0, auth_1.requirePermission)("customers:read"), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const [customers, total] = await Promise.all([
            prisma_1.default.user.findMany({
                select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, _count: { select: { orders: true } } },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma_1.default.user.count()
        ]);
        res.json({
            data: customers,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (err) {
        console.error("Get customers error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// GET /api/customers/:id
router.get("/:id", auth_1.authenticate, (0, auth_1.requirePermission)("customers:read"), async (req, res) => {
    try {
        const customer = await prisma_1.default.user.findUnique({
            where: { id: req.params.id },
            select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, orders: { include: { service: { select: { name: true } } }, orderBy: { createdAt: "desc" } } },
        });
        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }
        res.json(customer);
    }
    catch (err) {
        console.error("Get customer error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// PATCH /api/customers/:id
router.patch("/:id", auth_1.authenticate, (0, auth_1.requirePermission)("customers:write"), async (req, res) => {
    try {
        const { name, phone, role } = req.body;
        const data = {};
        if (name)
            data.name = name;
        if (phone !== undefined)
            data.phone = phone;
        if (role) {
            if (!(0, permissions_1.canAssignRole)(req.user.role, role)) {
                res.status(403).json({ message: "You cannot assign this role" });
                return;
            }
            data.role = role;
        }
        const updated = await prisma_1.default.user.update({ where: { id: req.params.id }, data, select: { id: true, name: true, email: true, phone: true, role: true } });
        res.json(updated);
    }
    catch (err) {
        console.error("Update customer error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// PUT /api/customers/me/addresses
router.put("/me/addresses", auth_1.authenticate, async (req, res) => {
    try {
        const { addresses } = req.body;
        if (!addresses || !Array.isArray(addresses)) {
            res.status(400).json({ message: "Invalid addresses format. Expected an array." });
            return;
        }
        const updated = await prisma_1.default.user.update({
            where: { id: req.user.id },
            data: { addresses },
            select: { id: true, addresses: true }
        });
        res.json(updated.addresses);
    }
    catch (err) {
        console.error("Update addresses error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// DELETE /api/customers/:id — admin only
router.delete("/:id", auth_1.authenticate, (0, auth_1.requirePermission)("customers:delete"), async (req, res) => {
    try {
        // Soft-delete: check if user has orders
        const orderCount = await prisma_1.default.order.count({ where: { customerId: req.params.id } });
        if (orderCount > 0) {
            // Soft delete by updating deletedAt
            await prisma_1.default.user.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
        }
        else {
            await prisma_1.default.user.delete({ where: { id: req.params.id } });
        }
        res.json({ message: "Customer deleted" });
    }
    catch (err) {
        console.error("Delete customer error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=customers.js.map