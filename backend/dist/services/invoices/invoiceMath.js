"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatInvoiceNumber = formatInvoiceNumber;
exports.calculateInvoiceTotals = calculateInvoiceTotals;
function formatInvoiceNumber(year, sequence) {
    return `LUX-${year}-${String(sequence).padStart(4, "0")}`;
}
function money(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
function calculateInvoiceTotals(input) {
    const subtotal = money(input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
    const deliveryCharge = input.deliveryCharge ?? 0;
    const discountAmount = input.discountAmount ?? 0;
    const gstRate = input.gstRate ?? 18;
    const taxableAmount = money(Math.max(0, subtotal + deliveryCharge - discountAmount));
    const taxAmount = money((taxableAmount * gstRate) / 100);
    const cgstAmount = money(taxAmount / 2);
    const sgstAmount = money(taxAmount / 2);
    return {
        subtotal,
        taxableAmount,
        taxAmount,
        cgstAmount,
        sgstAmount,
        totalAmount: money(taxableAmount + taxAmount),
    };
}
//# sourceMappingURL=invoiceMath.js.map