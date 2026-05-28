"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const generatePdf_1 = require("../services/invoices/generatePdf");
const invoiceService_1 = require("../services/invoices/invoiceService");
const whatsapp_1 = require("../services/notifications/whatsapp");
const invoices_1 = require("../validators/invoices");
const router = (0, express_1.Router)();
function handleRouteError(res, error) {
    if (error instanceof zod_1.ZodError) {
        res.status(400).json({ message: "Validation failed", errors: error.flatten() });
        return;
    }
    const maybeError = error;
    console.error("Invoice route error:", error);
    res.status(maybeError.statusCode || 500).json({ message: maybeError.message || "Server error" });
}
router.post("/create/:orderId", auth_1.authenticate, (0, auth_1.requirePermission)("invoices:write"), async (req, res) => {
    try {
        const input = invoices_1.createInvoiceFromOrderSchema.parse(req.body);
        const invoice = await (0, invoiceService_1.createInvoiceFromOrder)(req.params.orderId, input);
        res.status(201).json(invoice);
    }
    catch (error) {
        handleRouteError(res, error);
    }
});
router.post("/manual", auth_1.authenticate, (0, auth_1.requirePermission)("invoices:write"), async (req, res) => {
    try {
        const input = invoices_1.manualInvoiceSchema.parse(req.body);
        const invoice = await (0, invoiceService_1.createManualInvoice)(input);
        res.status(201).json(invoice);
    }
    catch (error) {
        handleRouteError(res, error);
    }
});
router.get("/", auth_1.authenticate, (0, auth_1.requirePermission)("invoices:read"), async (req, res) => {
    try {
        const query = invoices_1.invoiceQuerySchema.parse(req.query);
        res.json(await (0, invoiceService_1.listInvoices)(query));
    }
    catch (error) {
        handleRouteError(res, error);
    }
});
router.get("/analytics", auth_1.authenticate, (0, auth_1.requirePermission)("invoices:read"), async (req, res) => {
    try {
        res.json(await (0, invoiceService_1.invoiceAnalytics)());
    }
    catch (error) {
        handleRouteError(res, error);
    }
});
router.get("/customer/me", auth_1.authenticate, async (req, res) => {
    try {
        res.json(await (0, invoiceService_1.listCustomerInvoices)(req.user.id));
    }
    catch (error) {
        handleRouteError(res, error);
    }
});
router.get("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const invoice = await (0, invoiceService_1.findInvoiceForUser)(req.params.id, req.user);
        if (!invoice) {
            res.status(404).json({ message: "Invoice not found" });
            return;
        }
        res.json(invoice);
    }
    catch (error) {
        handleRouteError(res, error);
    }
});
router.get("/:id/pdf", auth_1.authenticate, async (req, res) => {
    try {
        const invoice = await (0, invoiceService_1.findInvoiceForUser)(req.params.id, req.user);
        if (!invoice) {
            res.status(404).json({ message: "Invoice not found" });
            return;
        }
        const fs = require('fs');
        const path = require('path');
        const logoBuffer = fs.existsSync(path.join(__dirname, '../../../../frontend/public/images/logo.png'))
            ? fs.readFileSync(path.join(__dirname, '../../../../frontend/public/images/logo.png')) : undefined;
        const qrBuffer = fs.existsSync(path.join(__dirname, '../../../../frontend/public/images/qr.jpeg'))
            ? fs.readFileSync(path.join(__dirname, '../../../../frontend/public/images/qr.jpeg')) : undefined;
        const stream = await (0, generatePdf_1.generateInvoicePdfStream)(invoice, logoBuffer, qrBuffer);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceNumber}.pdf"`);
        stream.pipe(res);
    }
    catch (error) {
        handleRouteError(res, error);
    }
});
router.get("/:id/whatsapp-url", auth_1.authenticate, async (req, res) => {
    try {
        const invoice = await (0, invoiceService_1.findInvoiceForUser)(req.params.id, req.user);
        if (!invoice) {
            res.status(404).json({ message: "Invoice not found" });
            return;
        }
        const message = [
            `LuxWash invoice ${invoice.invoiceNumber}`,
            `Amount: Rs. ${invoice.totalAmount}`,
            `Payment: ${invoice.paymentStatus}`,
            "Support: +91-9663574728",
        ].join("\n");
        const phone = invoice.customer.phone || "+919663574728";
        const clickUrl = (0, whatsapp_1.buildWhatsAppClickToChatUrl)(phone, message);
        await prisma_1.default.whatsAppLog.create({
            data: {
                phone,
                message,
                category: "INVOICE_SHARE",
                status: "LINK_CREATED",
                clickUrl,
                invoiceId: invoice.id,
            },
        });
        res.json({ url: clickUrl });
    }
    catch (error) {
        handleRouteError(res, error);
    }
});
router.patch("/:id/status", auth_1.authenticate, (0, auth_1.requirePermission)("invoices:write"), async (req, res) => {
    try {
        const input = invoices_1.updateInvoiceStatusSchema.parse(req.body);
        res.json(await (0, invoiceService_1.updateInvoiceStatus)(req.params.id, input));
    }
    catch (error) {
        handleRouteError(res, error);
    }
});
router.delete("/:id", auth_1.authenticate, (0, auth_1.requirePermission)("invoices:write"), async (req, res) => {
    try {
        await (0, invoiceService_1.archiveInvoice)(req.params.id);
        res.json({ message: "Invoice archived" });
    }
    catch (error) {
        handleRouteError(res, error);
    }
});
exports.default = router;
//# sourceMappingURL=invoices.js.map