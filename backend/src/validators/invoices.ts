import { z } from "zod";

export const invoiceStatusSchema = z.enum(["DRAFT", "SENT", "PAID", "CANCELLED", "ARCHIVED"]);
export const paymentStatusSchema = z.enum(["UNPAID", "PAID", "PARTIAL", "REFUNDED"]);
export const paymentMethodSchema = z.enum(["CASH", "UPI", "MANUAL_UPI", "RAZORPAY", "CARD", "BANK_TRANSFER"]);

export const createInvoiceFromOrderSchema = z.object({
  deliveryCharge: z.coerce.number().min(0).optional(),
  discountAmount: z.coerce.number().min(0).optional(),
  paymentMethod: paymentMethodSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  notes: z.string().max(1000).optional(),
  dueDate: z.coerce.date().optional(),
});

export const manualInvoiceSchema = z.object({
  customerId: z.string().min(1),
  items: z.array(z.object({
    serviceName: z.string().min(1).max(120),
    quantity: z.coerce.number().positive(),
    unit: z.string().min(1).max(30),
    unitPrice: z.coerce.number().min(0),
  })).min(1),
  deliveryCharge: z.coerce.number().min(0).optional(),
  discountAmount: z.coerce.number().min(0).optional(),
  paymentMethod: paymentMethodSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  invoiceStatus: invoiceStatusSchema.optional(),
  notes: z.string().max(1000).optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateInvoiceStatusSchema = z.object({
  paymentStatus: paymentStatusSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  invoiceStatus: invoiceStatusSchema.optional(),
  notes: z.string().max(1000).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one invoice field is required",
});

export const invoiceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: invoiceStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  search: z.string().trim().max(100).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  includeArchived: z.coerce.boolean().default(false),
});
