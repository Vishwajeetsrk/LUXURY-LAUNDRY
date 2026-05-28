export interface InvoiceCalculationInput {
  items: Array<{ quantity: number; unitPrice: number }>;
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

export function formatInvoiceNumber(year: number, sequence: number): string {
  return `LUX-${year}-${String(sequence).padStart(4, "0")}`;
}

function money(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateInvoiceTotals(input: InvoiceCalculationInput): InvoiceTotals {
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
