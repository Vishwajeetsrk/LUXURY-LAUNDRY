"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.buildOrderConfirmationEmail = buildOrderConfirmationEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
async function sendEmail({ to, subject, html }) {
    if (!process.env.SMTP_USER) {
        console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
        return;
    }
    try {
        const info = await transporter.sendMail({
            from: `"LuxWash Premium Laundry" <${process.env.SMTP_FROM || "noreply@luxwash.com"}>`,
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
    }
    catch (error) {
        console.error("Error sending email:", error);
    }
}
function buildOrderConfirmationEmail(order) {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Order Confirmation</h2>
      <p>Hello ${order.customerName},</p>
      <p>Your LuxWash order <strong>#${order.id}</strong> has been confirmed.</p>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
      <p>We will pick up your laundry as scheduled.</p>
      <br />
      <p>Thank you,<br/>LuxWash Team</p>
    </div>
  `;
}
//# sourceMappingURL=email.js.map