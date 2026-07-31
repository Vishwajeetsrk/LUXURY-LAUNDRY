import express, { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRoles, requirePermission } from "../middleware/auth";

const router = express.Router();

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; name: string };
}

// Assign an order to a staff member (SUPER_ADMIN or ADMIN only)
router.post("/assign", authenticate, requireRoles(["SUPER_ADMIN", "ADMIN"]), async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, staffId } = req.body;

    // Check if staff exists and is STAFF/DELIVERY
    const staff = await prisma.user.findUnique({ where: { id: staffId } });
    if (!staff || (staff.role !== "STAFF" && staff.role !== "DELIVERY")) {
      res.status(400).json({ error: "Invalid staff member selected" });
      return;
    }

    // Generate a 4 digit OTP for the delivery
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        staffId: staffId,
        deliveryOTP: otp,
        status: "OUT_FOR_DELIVERY",
      },
    });

    res.json({ message: "Order assigned to staff", order });
  } catch (error) {
    console.error("Assign order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify OTP to complete delivery (STAFF or DELIVERY only)
router.post("/verify-otp", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, otp } = req.body;
    const staffId = req.user!.id;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    if (order.staffId !== staffId) {
      res.status(403).json({ error: "You are not assigned to this order" });
      return;
    }

    if (order.deliveryOTP !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
        deliveryDate: new Date(),
      },
    });

    res.json({ message: "Delivery verified and completed", order: updatedOrder });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mark staff attendance (STAFF or DELIVERY only)
router.post("/attendance", authenticate, requireRoles(["STAFF", "DELIVERY"]), async (req: AuthRequest, res: Response) => {
  try {
    const staffId = req.user!.id;
    const { status } = req.body; // ONLINE, OFFLINE

    const updated = await prisma.user.update({
      where: { id: staffId },
      data: {
        staffStatus: status,
        lastAttendance: new Date(),
      },
    });

    res.json({ message: "Attendance updated", user: updated });
  } catch (error) {
    console.error("Attendance error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export const deliveryRoutes = router;
export default router;
