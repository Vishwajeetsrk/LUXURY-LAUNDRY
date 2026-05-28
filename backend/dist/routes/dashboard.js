"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/dashboard/stats — admin only
router.get("/stats", auth_1.authenticate, (0, auth_1.requirePermission)("dashboard:read"), async (req, res) => {
    try {
        const [totalOrders, totalCustomers, totalServices, pendingOrders, revenueResult, recentOrders, allCompletedOrders] = await Promise.all([
            prisma_1.default.order.count(),
            prisma_1.default.user.count({ where: { role: "CUSTOMER" } }),
            prisma_1.default.service.count({ where: { isActive: true } }),
            prisma_1.default.order.count({ where: { status: "PENDING" } }),
            prisma_1.default.order.aggregate({ _sum: { totalAmount: true } }),
            prisma_1.default.order.findMany({
                take: 10,
                orderBy: { createdAt: "desc" },
                include: {
                    customer: { select: { name: true } },
                    service: { select: { name: true } },
                },
            }),
            prisma_1.default.order.findMany({
                where: { status: { in: ["DELIVERED", "COMPLETED"] } },
                select: { totalAmount: true, createdAt: true },
            })
        ]);
        // Calculate revenue by month for chart
        const revenueByMonth = {};
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        // Initialize last 6 months
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            revenueByMonth[`${months[d.getMonth()]} ${d.getFullYear()}`] = 0;
        }
        // Populate actual revenue
        allCompletedOrders.forEach((order) => {
            const d = new Date(order.createdAt);
            const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
            if (revenueByMonth[key] !== undefined) {
                revenueByMonth[key] += order.totalAmount;
            }
        });
        const chartData = Object.keys(revenueByMonth).map((key) => ({
            month: key,
            revenue: revenueByMonth[key],
        }));
        res.json({
            totalOrders,
            totalCustomers,
            totalRevenue: revenueResult?._sum?.totalAmount || 0,
            totalServices,
            pendingOrders,
            chartData,
            recentOrders: recentOrders.map((o) => ({
                id: o.id,
                customerName: o.customer.name,
                serviceName: o.service.name,
                status: o.status,
                totalAmount: o.totalAmount,
                createdAt: o.createdAt,
            })),
        });
    }
    catch (err) {
        console.error("Dashboard stats error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map