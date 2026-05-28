type InvoiceForPdf = {
    invoiceNumber: string;
    id?: string;
    subtotal: number;
    taxableAmount: number;
    gstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    taxAmount: number;
    discountAmount: number;
    deliveryCharge: number;
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    invoiceStatus: string;
    notes?: string | null;
    generatedAt: Date;
    dueDate?: Date | null;
    customer: {
        name: string;
        email: string;
        phone?: string | null;
    };
    order?: {
        id: string;
        address: string;
        pickupDate?: Date | null;
        deliveryDate?: Date | null;
        status: string;
    } | null;
    items: Array<{
        serviceName: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
    }>;
};
export declare function generateInvoicePdf(invoice: InvoiceForPdf): Promise<Buffer>;
export {};
//# sourceMappingURL=invoicePdf.d.ts.map