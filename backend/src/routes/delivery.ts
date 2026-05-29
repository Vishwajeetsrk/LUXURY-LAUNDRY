import { Router, Request, Response, RequestHandler } from "react-router-dom"; // wait no
import express from 'express';
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, requirePermission } from "../middleware/auth";

const router = express.Router();

// Assign an order to a staff member (SUPER_ADMIN or ADMIN only)
export const assignOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId, staffId } = req.body;
    
    // Check if staff exists and is STAFF/DELIVERY
    const staff = await prisma.user.findUnique({ where: { id: staffId } });
    if (!staff || (staff.role !== 'STAFF' && staff.role !== 'DELIVERY')) {
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
        status: "OUT_FOR_DELIVERY"
      }
    });

    res.json({ message: "Order assigned to staff", order });
  } catch (error) {
    console.error("Assign order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify OTP to complete delivery (STAFF or DELIVERY only)
export const verifyOtp: RequestHandler = async (req: any, res) => {
  try {
    const { orderId, otp } = req.body;
    const staffId = req.user.id; // from auth middleware

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
        deliveryDate: new Date()
      }
    });

    res.json({ message: "Delivery verified and completed", order: updatedOrder });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark staff attendance (STAFF or DELIVERY only)
export const markAttendance: RequestHandler = async (req: any, res) => {
  try {
    const staffId = req.user.id;
    const { status } = req.body; // ONLINE, OFFLINE

    const updated = await prisma.user.update({
      where: { id: staffId },
      data: {
        staffStatus: status,
        lastAttendance: new Date()
      }
    });

    res.json({ message: "Attendance updated", user: updated });
  } catch (error) {
    console.error("Attendance error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Routes
router.post('/assign', authenticate, requirePermission('ORDERS_EDIT'), assignOrder);
router.post('/verify-otp', authenticate, verifyOtp);
router.post('/attendance', authenticate, markAttendance);

export const deliveryRoutes = router;
