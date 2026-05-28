import { describe, expect, it } from "vitest";
import { calculateInvoiceTotals, formatInvoiceNumber } from "./invoiceMath";

describe("invoice numbering", () => {
  it("formats yearly LuxWash invoice numbers with zero padded sequence", () => {
    expect(formatInvoiceNumber(2026, 1)).toBe("LUX-2026-0001");
    expect(formatInvoiceNumber(2026, 42)).toBe("LUX-2026-0042");
  });
});

describe("invoice totals", () => {
  it("applies 18% GST to service subtotal plus delivery after discount", () => {
    const totals = calculateInvoiceTotals({
      items: [{ quantity: 3, unitPrice: 100 }],
      deliveryCharge: 50,
      discountAmount: 20,
      gstRate: 18,
    });

    expect(totals).toEqual({
      subtotal: 300,
      taxableAmount: 330,
      taxAmount: 59.4,
      cgstAmount: 29.7,
      sgstAmount: 29.7,
      totalAmount: 389.4,
    });
  });
});
