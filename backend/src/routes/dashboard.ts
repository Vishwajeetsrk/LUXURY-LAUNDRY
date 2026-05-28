import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";

const router = Router();

// GET /api/dashboard/stats — admin only
router.get("/stats", authenticate, requirePermission("dashboard:read"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalOrders, totalCustomers, totalServices, pendingOrders, revenueResult, recentOrders, allCompletedOrders] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true } },
          service: { select: { name: true } },
        },
      }),
      prisma.order.findMany({
        where: { status: { in: ["DELIVERED", "COMPLETED"] } },
        select: { totalAmount: true, createdAt: true },
      })
    ]);

    // Calculate revenue by month for chart
    const revenueByMonth: Record<string, number> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      revenueByMonth[`${months[d.getMonth()]} ${d.getFullYear()}`] = 0;
    }

    // Populate actual revenue
    allCompletedOrders.forEach((order: { createdAt: Date; totalAmount: number }) => {
      const d = new Date(order.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      if (revenueByMonth[key] !== undefined) {
        revenueByMonth[key] += order.totalAmount;
      }
    });

    const chartData = Object.keys(revenueByMonth).map((key: string) => ({
      month: key,
      revenue: revenueByMonth[key],
    }));

    res.json({
      totalOrders,
      totalCustomers,
      totalRevenue: (revenueResult as any)?._sum?.totalAmount || 0,
      totalServices,
      pendingOrders,
      chartData,
      recentOrders: recentOrders.map((o: any) => ({
        id: o.id,
        customerName: o.customer.name,
        serviceName: o.service.name,
        status: o.status,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt,
      })),
    });

  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
