import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === "admin" || process.env.SMTP_USER === "your_smtp_user") {
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
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export function buildOrderConfirmationEmail(order: any) {
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
