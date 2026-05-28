"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const invoiceMath_1 = require("./invoiceMath");
(0, vitest_1.describe)("invoice numbering", () => {
    (0, vitest_1.it)("formats yearly LuxWash invoice numbers with zero padded sequence", () => {
        (0, vitest_1.expect)((0, invoiceMath_1.formatInvoiceNumber)(2026, 1)).toBe("LUX-2026-0001");
        (0, vitest_1.expect)((0, invoiceMath_1.formatInvoiceNumber)(2026, 42)).toBe("LUX-2026-0042");
    });
});
(0, vitest_1.describe)("invoice totals", () => {
    (0, vitest_1.it)("applies 18% GST to service subtotal plus delivery after discount", () => {
        const totals = (0, invoiceMath_1.calculateInvoiceTotals)({
            items: [{ quantity: 3, unitPrice: 100 }],
            deliveryCharge: 50,
            discountAmount: 20,
            gstRate: 18,
        });
        (0, vitest_1.expect)(totals).toEqual({
            subtotal: 300,
            taxableAmount: 330,
            taxAmount: 59.4,
            cgstAmount: 29.7,
            sgstAmount: 29.7,
            totalAmount: 389.4,
        });
    });
});
//# sourceMappingURL=invoiceMath.test.js.map