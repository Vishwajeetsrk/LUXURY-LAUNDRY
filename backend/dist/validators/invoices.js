"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceQuerySchema = exports.updateInvoiceStatusSchema = exports.manualInvoiceSchema = exports.createInvoiceFromOrderSchema = exports.paymentMethodSchema = exports.paymentStatusSchema = exports.invoiceStatusSchema = void 0;
const zod_1 = require("zod");
exports.invoiceStatusSchema = zod_1.z.enum(["DRAFT", "SENT", "PAID", "CANCELLED", "ARCHIVED"]);
exports.paymentStatusSchema = zod_1.z.enum(["UNPAID", "PAID", "PARTIAL", "REFUNDED"]);
exports.paymentMethodSchema = zod_1.z.enum(["CASH", "UPI", "MANUAL_UPI", "RAZORPAY", "CARD", "BANK_TRANSFER"]);
exports.createInvoiceFromOrderSchema = zod_1.z.object({
    deliveryCharge: zod_1.z.coerce.number().min(0).optional(),
    discountAmount: zod_1.z.coerce.number().min(0).optional(),
    paymentMethod: exports.paymentMethodSchema.optional(),
    paymentStatus: exports.paymentStatusSchema.optional(),
    notes: zod_1.z.string().max(1000).optional(),
    dueDate: zod_1.z.coerce.date().optional(),
});
exports.manualInvoiceSchema = zod_1.z.object({
    customerId: zod_1.z.string().min(1),
    items: zod_1.z.array(zod_1.z.object({
        serviceName: zod_1.z.string().min(1).max(120),
        quantity: zod_1.z.coerce.number().positive(),
        unit: zod_1.z.string().min(1).max(30),
        unitPrice: zod_1.z.coerce.number().min(0),
    })).min(1),
    deliveryCharge: zod_1.z.coerce.number().min(0).optional(),
    discountAmount: zod_1.z.coerce.number().min(0).optional(),
    paymentMethod: exports.paymentMethodSchema.optional(),
    paymentStatus: exports.paymentStatusSchema.optional(),
    invoiceStatus: exports.invoiceStatusSchema.optional(),
    notes: zod_1.z.string().max(1000).optional(),
    dueDate: zod_1.z.coerce.date().optional(),
});
exports.updateInvoiceStatusSchema = zod_1.z.object({
    paymentStatus: exports.paymentStatusSchema.optional(),
    paymentMethod: exports.paymentMethodSchema.optional(),
    invoiceStatus: exports.invoiceStatusSchema.optional(),
    notes: zod_1.z.string().max(1000).optional(),
}).refine((value) => Object.keys(value).length > 0, {
    message: "At least one invoice field is required",
});
exports.invoiceQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    status: exports.invoiceStatusSchema.optional(),
    paymentStatus: exports.paymentStatusSchema.optional(),
    search: zod_1.z.string().trim().max(100).optional(),
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
    includeArchived: zod_1.z.coerce.boolean().default(false),
});
//# sourceMappingURL=invoices.js.map