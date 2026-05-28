import { z } from "zod";
export declare const invoiceStatusSchema: z.ZodEnum<{
    PAID: "PAID";
    SENT: "SENT";
    DRAFT: "DRAFT";
    ARCHIVED: "ARCHIVED";
    CANCELLED: "CANCELLED";
}>;
export declare const paymentStatusSchema: z.ZodEnum<{
    UNPAID: "UNPAID";
    PAID: "PAID";
    PARTIAL: "PARTIAL";
    REFUNDED: "REFUNDED";
}>;
export declare const paymentMethodSchema: z.ZodEnum<{
    CASH: "CASH";
    UPI: "UPI";
    MANUAL_UPI: "MANUAL_UPI";
    RAZORPAY: "RAZORPAY";
    CARD: "CARD";
    BANK_TRANSFER: "BANK_TRANSFER";
}>;
export declare const createInvoiceFromOrderSchema: z.ZodObject<{
    deliveryCharge: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    discountAmount: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    paymentMethod: z.ZodOptional<z.ZodEnum<{
        CASH: "CASH";
        UPI: "UPI";
        MANUAL_UPI: "MANUAL_UPI";
        RAZORPAY: "RAZORPAY";
        CARD: "CARD";
        BANK_TRANSFER: "BANK_TRANSFER";
    }>>;
    paymentStatus: z.ZodOptional<z.ZodEnum<{
        UNPAID: "UNPAID";
        PAID: "PAID";
        PARTIAL: "PARTIAL";
        REFUNDED: "REFUNDED";
    }>>;
    notes: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
export declare const manualInvoiceSchema: z.ZodObject<{
    customerId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        serviceName: z.ZodString;
        quantity: z.ZodCoercedNumber<unknown>;
        unit: z.ZodString;
        unitPrice: z.ZodCoercedNumber<unknown>;
    }, z.core.$strip>>;
    deliveryCharge: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    discountAmount: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    paymentMethod: z.ZodOptional<z.ZodEnum<{
        CASH: "CASH";
        UPI: "UPI";
        MANUAL_UPI: "MANUAL_UPI";
        RAZORPAY: "RAZORPAY";
        CARD: "CARD";
        BANK_TRANSFER: "BANK_TRANSFER";
    }>>;
    paymentStatus: z.ZodOptional<z.ZodEnum<{
        UNPAID: "UNPAID";
        PAID: "PAID";
        PARTIAL: "PARTIAL";
        REFUNDED: "REFUNDED";
    }>>;
    invoiceStatus: z.ZodOptional<z.ZodEnum<{
        PAID: "PAID";
        SENT: "SENT";
        DRAFT: "DRAFT";
        ARCHIVED: "ARCHIVED";
        CANCELLED: "CANCELLED";
    }>>;
    notes: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
export declare const updateInvoiceStatusSchema: z.ZodObject<{
    paymentStatus: z.ZodOptional<z.ZodEnum<{
        UNPAID: "UNPAID";
        PAID: "PAID";
        PARTIAL: "PARTIAL";
        REFUNDED: "REFUNDED";
    }>>;
    paymentMethod: z.ZodOptional<z.ZodEnum<{
        CASH: "CASH";
        UPI: "UPI";
        MANUAL_UPI: "MANUAL_UPI";
        RAZORPAY: "RAZORPAY";
        CARD: "CARD";
        BANK_TRANSFER: "BANK_TRANSFER";
    }>>;
    invoiceStatus: z.ZodOptional<z.ZodEnum<{
        PAID: "PAID";
        SENT: "SENT";
        DRAFT: "DRAFT";
        ARCHIVED: "ARCHIVED";
        CANCELLED: "CANCELLED";
    }>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const invoiceQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    status: z.ZodOptional<z.ZodEnum<{
        PAID: "PAID";
        SENT: "SENT";
        DRAFT: "DRAFT";
        ARCHIVED: "ARCHIVED";
        CANCELLED: "CANCELLED";
    }>>;
    paymentStatus: z.ZodOptional<z.ZodEnum<{
        UNPAID: "UNPAID";
        PAID: "PAID";
        PARTIAL: "PARTIAL";
        REFUNDED: "REFUNDED";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    to: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    includeArchived: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=invoices.d.ts.map