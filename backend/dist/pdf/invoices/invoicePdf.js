"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePdf = generateInvoicePdf;
const pdf_lib_1 = require("pdf-lib");
const qrcode_1 = __importDefault(require("qrcode"));
const business = {
    name: "LuxWash Premium Laundry",
    gst: "GST-ready: 18% CGST/SGST",
    address: "Shop No. 504, Bagrota, Ajmer Road, Jaipur, Rajasthan",
    phone: "+91-9663574728",
    email: "support@luxwash.com",
};
function rs(value) {
    return `Rs. ${value.toFixed(2)}`;
}
function drawText(page, text, x, y, size, font, color = (0, pdf_lib_1.rgb)(0.12, 0.16, 0.22)) {
    page.drawText(text.slice(0, 95), { x, y, size, font, color });
}
async function generateInvoicePdf(invoice) {
    const pdf = await pdf_lib_1.PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);
    const bold = await pdf.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    const regular = await pdf.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    const blue = (0, pdf_lib_1.rgb)(0.05, 0.43, 0.99);
    const muted = (0, pdf_lib_1.rgb)(0.42, 0.47, 0.55);
    page.drawRectangle({ x: 0, y: 770, width: 595.28, height: 72, color: blue });
    drawText(page, business.name, 40, 805, 20, bold, (0, pdf_lib_1.rgb)(1, 1, 1));
    drawText(page, "Professional Laundry Invoice", 40, 784, 10, regular, (0, pdf_lib_1.rgb)(0.86, 0.93, 1));
    drawText(page, invoice.invoiceNumber, 410, 805, 16, bold, (0, pdf_lib_1.rgb)(1, 1, 1));
    drawText(page, `Status: ${invoice.paymentStatus}`, 410, 784, 10, regular, (0, pdf_lib_1.rgb)(0.86, 0.93, 1));
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
    page.drawRectangle({ x: 40, y: 592, width: 515, height: 28, color: (0, pdf_lib_1.rgb)(0.95, 0.97, 1) });
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
        page.drawLine({ start: { x: 40, y: y - 12 }, end: { x: 555, y: y - 12 }, thickness: 0.5, color: (0, pdf_lib_1.rgb)(0.9, 0.92, 0.95) });
        y -= 30;
    });
    const totalsY = Math.min(y - 10, 430);
    const rows = [
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
    drawText(page, "Grand Total", 360, totalLineY + 4, 11, bold, (0, pdf_lib_1.rgb)(1, 1, 1));
    drawText(page, rs(invoice.totalAmount), 472, totalLineY + 4, 11, bold, (0, pdf_lib_1.rgb)(1, 1, 1));
    const qrUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/invoices/${invoice.id || invoice.invoiceNumber}`;
    const qrDataUrl = await qrcode_1.default.toDataURL(qrUrl, { margin: 1, width: 120 });
    const qrImage = await pdf.embedPng(qrDataUrl);
    page.drawImage(qrImage, { x: 40, y: 230, width: 92, height: 92 });
    drawText(page, "Scan for invoice record", 40, 214, 9, regular, muted);
    drawText(page, "Terms", 160, 302, 12, bold);
    drawText(page, "Cash and manual UPI accepted. Paid invoices are locked for accounting integrity.", 160, 282, 9, regular, muted);
    drawText(page, "Thank you for choosing LuxWash. WhatsApp support: +91-9663574728.", 160, 264, 9, regular, muted);
    if (invoice.notes)
        drawText(page, `Notes: ${invoice.notes}`, 160, 246, 9, regular, muted);
    page.drawLine({ start: { x: 40, y: 190 }, end: { x: 555, y: 190 }, thickness: 0.8, color: (0, pdf_lib_1.rgb)(0.86, 0.9, 0.95) });
    drawText(page, "LuxWash Premium Laundry | Jaipur, Rajasthan | support@luxwash.com", 120, 168, 9, regular, muted);
    return Buffer.from(await pdf.save());
}
//# sourceMappingURL=invoicePdf.js.map