import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

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
  customer: { name: string; email: string; phone?: string | null };
  order?: { id: string; address: string; pickupDate?: Date | null; deliveryDate?: Date | null; status: string } | null;
  items: Array<{ serviceName: string; quantity: number; unit: string; unitPrice: number; totalPrice: number }>;
};

const business = {
  name: "LuxWash Premium Laundry",
  gst: "GST-ready: 18% CGST/SGST",
  address: "Shop No. 504, Bagrota, Ajmer Road, Jaipur, Rajasthan",
  phone: "+91-9663574728",
  email: "support@luxwash.com",
};

function rs(value: number): string {
  return `Rs. ${value.toFixed(2)}`;
}

function drawText(page: any, text: string, x: number, y: number, size: number, font: any, color = rgb(0.12, 0.16, 0.22)) {
  page.drawText(text.slice(0, 95), { x, y, size, font, color });
}

export async function generateInvoicePdf(invoice: InvoiceForPdf): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const blue = rgb(0.05, 0.43, 0.99);
  const muted = rgb(0.42, 0.47, 0.55);

  page.drawRectangle({ x: 0, y: 770, width: 595.28, height: 72, color: blue });
  drawText(page, business.name, 40, 805, 20, bold, rgb(1, 1, 1));
  drawText(page, "Professional Laundry Invoice", 40, 784, 10, regular, rgb(0.86, 0.93, 1));
  drawText(page, invoice.invoiceNumber, 410, 805, 16, bold, rgb(1, 1, 1));
  drawText(page, `Status: ${invoice.paymentStatus}`, 410, 784, 10, regular, rgb(0.86, 0.93, 1));

  drawText(page, "Business", 40, 735, 12, bold);
  drawText(page, business.gst, 40, 716, 9, regular, muted);
  drawText(page, business.address, 40, 700, 9, regular, muted);
  drawText(page, `${business.phone} | ${business.email}`, 40, 684, 9, regular, muted);

  drawText(page, "Customer", 335, 735, 12, bold);
  drawText(page, invoice.customer.name, 335, 716, 10, bold);
  drawText(page, invoice.customer.email, 335, 700, 9, regular, muted);
  drawText(page, invoice.customer.phone || "Phone not provided", 335, 684, 9, regular, muted);
  drawText(page, invoice.order?.address || "Manual invoice", 335, 668, 9, regular, muted);

  drawText(page, `Invoice Date: ${invoice.generatedAt.toLocaleDateString("en-IN")}`, 40, 640, 9, regular);
  drawText(page, `Order ID: ${invoice.order?.id || "Manual"}`, 215, 640, 9, regular);
  drawText(page, `Payment: ${invoice.paymentMethod}`, 410, 640, 9, regular);

  page.drawRectangle({ x: 40, y: 592, width: 515, height: 28, color: rgb(0.95, 0.97, 1) });
  drawText(page, "Service", 52, 602, 9, bold);
  drawText(page, "Qty", 285, 602, 9, bold);
  drawText(page, "Unit Price", 355, 602, 9, bold);
  drawText(page, "Total", 485, 602, 9, bold);

  let y = 565;
  invoice.items.forEach((item) => {
    drawText(page, item.serviceName, 52, y, 9, regular);
    drawText(page, `${item.quantity} ${item.unit}`, 285, y, 9, regular);
    drawText(page, rs(item.unitPrice), 355, y, 9, regular);
    drawText(page, rs(item.totalPrice), 485, y, 9, regular);
    page.drawLine({ start: { x: 40, y: y - 12 }, end: { x: 555, y: y - 12 }, thickness: 0.5, color: rgb(0.9, 0.92, 0.95) });
    y -= 30;
  });

  const totalsY = Math.min(y - 10, 430);
  const rows: Array<[string, number]> = [
    ["Subtotal", invoice.subtotal],
    ["Delivery", invoice.deliveryCharge],
    ["Discount", -invoice.discountAmount],
    ["Taxable", invoice.taxableAmount],
    [`CGST ${invoice.gstRate / 2}%`, invoice.cgstAmount],
    [`SGST ${invoice.gstRate / 2}%`, invoice.sgstAmount],
  ];
  let totalLineY = totalsY;
  rows.forEach(([label, value]) => {
    drawText(page, label, 360, totalLineY, 9, regular, muted);
    drawText(page, rs(value), 485, totalLineY, 9, regular);
    totalLineY -= 18;
  });
  page.drawRectangle({ x: 350, y: totalLineY - 8, width: 205, height: 32, color: blue });
  drawText(page, "Grand Total", 360, totalLineY + 4, 11, bold, rgb(1, 1, 1));
  drawText(page, rs(invoice.totalAmount), 472, totalLineY + 4, 11, bold, rgb(1, 1, 1));

  const qrUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/invoices/${invoice.id || invoice.invoiceNumber}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 120 });
  const qrImage = await pdf.embedPng(qrDataUrl);
  page.drawImage(qrImage, { x: 40, y: 230, width: 92, height: 92 });
  drawText(page, "Scan for invoice record", 40, 214, 9, regular, muted);

  drawText(page, "Terms", 160, 302, 12, bold);
  drawText(page, "Cash and manual UPI accepted. Paid invoices are locked for accounting integrity.", 160, 282, 9, regular, muted);
  drawText(page, "Thank you for choosing LuxWash. WhatsApp support: +91-9663574728.", 160, 264, 9, regular, muted);
  if (invoice.notes) drawText(page, `Notes: ${invoice.notes}`, 160, 246, 9, regular, muted);

  page.drawLine({ start: { x: 40, y: 190 }, end: { x: 555, y: 190 }, thickness: 0.8, color: rgb(0.86, 0.9, 0.95) });
  drawText(page, "LuxWash Premium Laundry | Jaipur, Rajasthan | support@luxwash.com", 120, 168, 9, regular, muted);

  return Buffer.from(await pdf.save());
}
