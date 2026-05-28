import { Router, Response } from "express";
import { ZodError } from "zod";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest, requirePermission } from "../middleware/auth";
import { generateInvoicePdfStream } from "../services/invoices/generatePdf";
import {
  archiveInvoice,
  createInvoiceFromOrder,
  createManualInvoice,
  findInvoiceForUser,
  invoiceAnalytics,
  listCustomerInvoices,
  listInvoices,
  updateInvoiceStatus,
} from "../services/invoices/invoiceService";
import { buildWhatsAppClickToChatUrl } from "../services/notifications/whatsapp";
import {
  createInvoiceFromOrderSchema,
  invoiceQuerySchema,
  manualInvoiceSchema,
  updateInvoiceStatusSchema,
} from "../validators/invoices";

const router = Router();

function handleRouteError(res: Response, error: unknown): void {
  if (error instanceof ZodError) {
    res.status(400).json({ message: "Validation failed", errors: error.flatten() });
    return;
  }
  const maybeError = error as Error & { statusCode?: number };
  console.error("Invoice route error:", error);
  res.status(maybeError.statusCode || 500).json({ message: maybeError.message || "Server error" });
}

router.post("/create/:orderId", authenticate, requirePermission("invoices:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const input = createInvoiceFromOrderSchema.parse(req.body);
    const invoice = await createInvoiceFromOrder(req.params.orderId as string, input);
    res.status(201).json(invoice);
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.post("/manual", authenticate, requirePermission("invoices:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const input = manualInvoiceSchema.parse(req.body);
    const invoice = await createManualInvoice(input);
    res.status(201).json(invoice);
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.get("/", authenticate, requirePermission("invoices:read"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = invoiceQuerySchema.parse(req.query);
    res.json(await listInvoices(query));
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.get("/analytics", authenticate, requirePermission("invoices:read"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json(await invoiceAnalytics());
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.get("/customer/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json(await listCustomerInvoices(req.user!.id));
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await findInvoiceForUser(req.params.id as string, req.user!);
    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }
    res.json(invoice);
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.get("/:id/pdf", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await findInvoiceForUser(req.params.id as string, req.user!);
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

    const stream = await generateInvoicePdfStream(invoice, logoBuffer, qrBuffer);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    stream.pipe(res);
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.get("/:id/whatsapp-url", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await findInvoiceForUser(req.params.id as string, req.user!);
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
    const clickUrl = buildWhatsAppClickToChatUrl(phone, message);

    await prisma.whatsAppLog.create({
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
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.patch("/:id/status", authenticate, requirePermission("invoices:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const input = updateInvoiceStatusSchema.parse(req.body);
    res.json(await updateInvoiceStatus(req.params.id as string, input));
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.delete("/:id", authenticate, requirePermission("invoices:write"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await archiveInvoice(req.params.id as string);
    res.json({ message: "Invoice archived" });
  } catch (error) {
    handleRouteError(res, error);
  }
});

export default router;
