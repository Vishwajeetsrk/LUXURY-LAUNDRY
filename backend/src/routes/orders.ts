import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";
import { hasPermission } from "../lib/permissions";
import { createInvoiceFromOrder } from "../services/invoices/invoiceService";
import {
  buildAdminOrderMessage,
  buildCustomerOrderMessage,
  sendWhatsAppIfConfigured,
} from "../services/notifications/whatsapp";
import { sendEmail, buildOrderConfirmationEmail } from "../services/notifications/email";

const router = Router();

// GET /api/orders — admin gets all, customer gets own
router.get("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const where = hasPermission(req.user!.role, "orders:read") ? {} : { customerId: req.user!.id };
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          service: { select: { id: true, name: true, unit: true } },
          invoice: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where })
    ]);
    
    res.json({
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/orders — create a new order
router.post("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceId, quantity, address, notes, pickupDate, customerId, paymentMethod, deliveryInstructions, deliveryCharge, useWallet } = req.body;
    if (!serviceId || !quantity || !address) {
      res.status(400).json({ message: "serviceId, quantity, and address are required" });
      return;
    }
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      res.status(404).json({ message: "Service not found" });
      return;
    }
    const totalAmount = service.pricePerUnit * quantity;
    const orderCustomerId =
      hasPermission(req.user!.role, "orders:write") && customerId ? customerId : req.user!.id;
    
    const order = await prisma.order.create({
      data: {
        customerId: orderCustomerId,
        serviceId,
        quantity,
        totalAmount,
        address,
        paymentMethod: paymentMethod || "CASH",
        deliveryInstructions: deliveryInstructions || null,
        notes: notes || null,
        pickupDate: pickupDate ? new Date(pickupDate) : null,
        status: "PENDING",
      },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        service: { select: { name: true, unit: true } },
      },
    });
    const invoice = await createInvoiceFromOrder(order.id, { paymentMethod: paymentMethod || "CASH", paymentStatus: "UNPAID", deliveryCharge: Number(deliveryCharge) || 0, useWallet: !!useWallet });
    const adminPhone = process.env.ADMIN_WHATSAPP_PHONE || "+919663574728";
    const orderSummary = {
      id: order.id.slice(0, 8).toUpperCase(),
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      address: order.address,
      services: [{ name: order.service.name, quantity: order.quantity, unit: order.service.unit }],
      pickupDate: order.pickupDate,
      paymentMethod: order.paymentMethod === "QR" ? "Pay via QR (UPI)" : "Cash on Delivery",
      totalAmount: invoice.totalAmount,
      deliveryInstructions: order.deliveryInstructions,
      notes: order.notes,
    };
    const adminMessage = buildAdminOrderMessage(orderSummary);
    const customerMessage = buildCustomerOrderMessage(orderSummary);
    const [adminWhatsApp, customerWhatsApp] = await Promise.all([
      sendWhatsAppIfConfigured(adminPhone, adminMessage),
      order.customer.phone ? sendWhatsAppIfConfigured(order.customer.phone, customerMessage) : Promise.resolve(null),
    ]);

    await prisma.whatsAppLog.createMany({
      data: [
        {
          phone: adminPhone,
          message: adminMessage,
          category: "ORDER_ADMIN_ALERT",
          status: adminWhatsApp.status,
          clickUrl: adminWhatsApp.clickUrl,
          orderId: order.id,
          invoiceId: invoice.id,
        },
        ...(customerWhatsApp ? [{
          phone: order.customer.phone!,
          message: customerMessage,
          category: "ORDER_CUSTOMER_CONFIRMATION",
          status: customerWhatsApp.status,
          clickUrl: customerWhatsApp.clickUrl,
          orderId: order.id,
          invoiceId: invoice.id,
        }] : []),
      ],
    });

    if (order.customer.email) {
      await sendEmail({
        to: order.customer.email,
        subject: "LuxWash - Order Confirmation",
        html: buildOrderConfirmationEmail(orderSummary)
      });
    }

    res.status(201).json({ ...order, invoice, whatsapp: { admin: adminWhatsApp, customer: customerWhatsApp } });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/orders/:id — update order (status, dates, etc.)
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({ where: { id }, include: { customer: { select: { phone: true, name: true } } } });
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    const canWrite = hasPermission(req.user!.role, "orders:write");
    const canUpdateStatus = hasPermission(req.user!.role, "orders:update-status");
    const isOwner = order.customerId === req.user!.id;

    if (!canWrite && !canUpdateStatus && !isOwner) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const { status, pickupDate, deliveryDate, notes, serviceId, quantity, address, totalAmount } = req.body;
    const data: Record<string, unknown> = {};

    if (canWrite || isOwner) {
      if (status) data.status = status;
      if (pickupDate) data.pickupDate = new Date(pickupDate);
      if (deliveryDate) data.deliveryDate = new Date(deliveryDate);
      if (notes !== undefined) data.notes = notes;
      if (canWrite) {
        if (serviceId) data.serviceId = serviceId;
        if (quantity !== undefined) data.quantity = quantity;
        if (address) data.address = address;
        if (totalAmount !== undefined) data.totalAmount = totalAmount;
      }
    } else if (canUpdateStatus) {
      if (status) data.status = status;
      else {
        res.status(403).json({ message: "Delivery staff can only update order status" });
        return;
      }
    }

    // OTP LOGIC (Deactivated per user request for now)
    /*
    if (status === "OUT_FOR_DELIVERY" && order.status !== "OUT_FOR_DELIVERY") {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      data.deliveryOTP = otp;
      
      // Send OTP to customer via WhatsApp
      if (order.customer.phone) {
        const msg = `Hello ${order.customer.name},\nYour LuxWash order #${id.slice(0,8).toUpperCase()} is OUT FOR DELIVERY! 🚚\n\nPlease share this OTP with our delivery executive: *${otp}*`;
        await sendWhatsAppIfConfigured(order.customer.phone, msg);
      }
    }

    if (status === "DELIVERED" && order.status !== "DELIVERED" && order.deliveryOTP) {
      if (!req.body.otp || req.body.otp.toString() !== order.deliveryOTP) {
        res.status(400).json({ message: "Invalid or missing delivery OTP" });
        return;
      }
      data.deliveryOTP = null; // Clear OTP after successful delivery
    }
    */

    const updated = await prisma.order.update({
      where: { id },
      data: data as any,
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        service: { select: { name: true } },
        invoice: { select: { id: true } },
      },
    });

    if (status === "DELIVERED" && updated.customer.phone && order.status !== "DELIVERED") {
      let message = `Hello ${updated.customer.name},\nYour LuxWash order #${updated.id.slice(0,8).toUpperCase()} has been successfully delivered!\nThank you for choosing us.`;
      
      if (updated.invoice?.id) {
        const invoiceLink = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/invoices/${updated.invoice.id}/pdf`;
        message += `\n\nYou can download your invoice here: ${invoiceLink}`;
      }

      const waRes = await sendWhatsAppIfConfigured(updated.customer.phone, message);
      await prisma.whatsAppLog.create({
        data: {
          phone: updated.customer.phone,
          message,
          category: "ORDER_DELIVERY_CONFIRMATION",
          status: waRes.status,
          clickUrl: waRes.clickUrl,
          orderId: updated.id,
          ...(updated.invoice?.id ? { invoiceId: updated.invoice.id } : {})
        },
      });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update order error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/orders/:id — admin only
router.delete("/:id", authenticate, requirePermission("orders:delete"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.order.delete({ where: { id: req.params.id as string } });
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error("Delete order error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
