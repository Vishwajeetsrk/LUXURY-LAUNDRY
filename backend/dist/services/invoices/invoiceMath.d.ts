export interface InvoiceCalculationInput {
    items: Array<{
        quantity: number;
        unitPrice: number;
    }>;
    deliveryCharge?: number;
    discountAmount?: number;
    gstRate?: number;
}
export interface InvoiceTotals {
    subtotal: number;
    taxableAmount: number;
    taxAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    totalAmount: number;
}
export declare function formatInvoiceNumber(year: number, sequence: number): string;
export declare function calculateInvoiceTotals(input: InvoiceCalculationInput): InvoiceTotals;
//# sourceMappingURL=invoiceMath.d.ts.map