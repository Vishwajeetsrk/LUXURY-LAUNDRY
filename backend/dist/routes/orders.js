"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const permissions_1 = require("../lib/permissions");
const invoiceService_1 = require("../services/invoices/invoiceService");
const whatsapp_1 = require("../services/notifications/whatsapp");
const email_1 = require("../services/notifications/email");
const router = (0, express_1.Router)();
// GET /api/orders — admin gets all, customer gets own
router.get("/", auth_1.authenticate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const where = (0, permissions_1.hasPermission)(req.user.role, "orders:read") ? {} : { customerId: req.user.id };
        const [orders, total] = await Promise.all([
            prisma_1.default.order.findMany({
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
            prisma_1.default.order.count({ where })
        ]);
        res.json({
            data: orders,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (err) {
        console.error("Get orders error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// POST /api/orders — create a new order
router.post("/", auth_1.authenticate, async (req, res) => {
    try {
        const { serviceId, quantity, address, notes, pickupDate, customerId, paymentMethod, deliveryInstructions } = req.body;
        if (!serviceId || !quantity || !address) {
            res.status(400).json({ message: "serviceId, quantity, and address are required" });
            return;
        }
        const service = await prisma_1.default.service.findUnique({ where: { id: serviceId } });
        if (!service) {
            res.status(404).json({ message: "Service not found" });
            return;
        }
        const totalAmount = service.pricePerUnit * quantity;
        const orderCustomerId = (0, permissions_1.hasPermission)(req.user.role, "orders:write") && customerId ? customerId : req.user.id;
        const order = await prisma_1.default.order.create({
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
        const invoice = await (0, invoiceService_1.createInvoiceFromOrder)(order.id, { paymentMethod: "CASH", paymentStatus: "UNPAID" });
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
        const adminMessage = (0, whatsapp_1.buildAdminOrderMessage)(orderSummary);
        const customerMessage = (0, whatsapp_1.buildCustomerOrderMessage)(orderSummary);
        const [adminWhatsApp, customerWhatsApp] = await Promise.all([
            (0, whatsapp_1.sendWhatsAppIfConfigured)(adminPhone, adminMessage),
            order.customer.phone ? (0, whatsapp_1.sendWhatsAppIfConfigured)(order.customer.phone, customerMessage) : Promise.resolve(null),
        ]);
        await prisma_1.default.whatsAppLog.createMany({
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
                        phone: order.customer.phone,
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
            await (0, email_1.sendEmail)({
                to: order.customer.email,
                subject: "LuxWash - Order Confirmation",
                html: (0, email_1.buildOrderConfirmationEmail)(orderSummary)
            });
        }
        res.status(201).json({ ...order, invoice, whatsapp: { admin: adminWhatsApp, customer: customerWhatsApp } });
    }
    catch (err) {
        console.error("Create order error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// PATCH /api/orders/:id — update order (status, dates, etc.)
router.patch("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const order = await prisma_1.default.order.findUnique({ where: { id } });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        const canWrite = (0, permissions_1.hasPermission)(req.user.role, "orders:write");
        const canUpdateStatus = (0, permissions_1.hasPermission)(req.user.role, "orders:update-status");
        const isOwner = order.customerId === req.user.id;
        if (!canWrite && !canUpdateStatus && !isOwner) {
            res.status(403).json({ message: "Not authorized" });
            return;
        }
        const { status, pickupDate, deliveryDate, notes, serviceId, quantity, address, totalAmount } = req.body;
        const data = {};
        if (canWrite || isOwner) {
            if (status)
                data.status = status;
            if (pickupDate)
                data.pickupDate = new Date(pickupDate);
            if (deliveryDate)
                data.deliveryDate = new Date(deliveryDate);
            if (notes !== undefined)
                data.notes = notes;
            if (canWrite) {
                if (serviceId)
                    data.serviceId = serviceId;
                if (quantity !== undefined)
                    data.quantity = quantity;
                if (address)
                    data.address = address;
                if (totalAmount !== undefined)
                    data.totalAmount = totalAmount;
            }
        }
        else if (canUpdateStatus) {
            if (status)
                data.status = status;
            else {
                res.status(403).json({ message: "Delivery staff can only update order status" });
                return;
            }
        }
        const updated = await prisma_1.default.order.update({
            where: { id },
            data: data,
            include: {
                customer: { select: { name: true, email: true, phone: true } },
                service: { select: { name: true } },
                invoice: { select: { id: true } },
            },
        });
        if (status === "DELIVERED" && updated.customer.phone && order.status !== "DELIVERED") {
            let message = `Hello ${updated.customer.name},\nYour LuxWash order #${updated.id.slice(0, 8).toUpperCase()} has been successfully delivered!\nThank you for choosing us.`;
            if (updated.invoice?.id) {
                const invoiceLink = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/invoices/${updated.invoice.id}/pdf`;
                message += `\n\nYou can download your invoice here: ${invoiceLink}`;
            }
            const waRes = await (0, whatsapp_1.sendWhatsAppIfConfigured)(updated.customer.phone, message);
            await prisma_1.default.whatsAppLog.create({
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
    }
    catch (err) {
        console.error("Update order error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// DELETE /api/orders/:id — admin only
router.delete("/:id", auth_1.authenticate, (0, auth_1.requirePermission)("orders:delete"), async (req, res) => {
    try {
        await prisma_1.default.order.delete({ where: { id: req.params.id } });
        res.json({ message: "Order deleted" });
    }
    catch (err) {
        console.error("Delete order error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map