export interface WhatsAppOrderSummary {
  id: string;
  customerName: string;
  customerPhone?: string | null;
  address: string;
  services: Array<{ name: string; quantity: number; unit: string }>;
  pickupDate?: Date | string | null;
  paymentMethod: string;
  totalAmount: number;
  deliveryInstructions?: string | null;
  notes?: string | null;
}

export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

function formatDate(value?: Date | string | null): string {
  if (!value) return "To be confirmed";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function buildAdminOrderMessage(order: WhatsAppOrderSummary): string {
  const services = order.services
    .map((service) => `- ${service.name} - ${service.quantity} ${service.unit}`)
    .join("\n");

  return [
    "New Order Received",
    "",
    `Order ID: #${order.id}`,
    "",
    "Customer:",
    `Name: ${order.customerName}`,
    `Phone: ${order.customerPhone || "Not provided"}`,
    "",
    "Pickup Address:",
    order.address,
    "",
    "Services:",
    services,
    "",
    "Pickup Date:",
    formatDate(order.pickupDate),
    "",
    `Payment: ${order.paymentMethod}`,
    order.paymentMethod.includes("QR") ? "⚠️ EXPECT SCREENSHOT OF PAYMENT ⚠️" : "",
    "",
    `Total: Rs. ${order.totalAmount}`,
    "",
    "Delivery Instructions:",
    order.deliveryInstructions || "None",
    "",
    "Special Notes:",
    order.notes || "None",
  ].filter(Boolean).join("\n");
}

export function buildCustomerOrderMessage(order: WhatsAppOrderSummary): string {
  return [
    "Your LuxWash order is confirmed.",
    "",
    `Order ID: #${order.id}`,
    `Pickup: ${formatDate(order.pickupDate)}`,
    `Payment: ${order.paymentMethod}`,
    `Total: Rs. ${order.totalAmount}`,
    "",
    "For support, WhatsApp us at +91-9663574728.",
  ].join("\n");
}

export function buildWhatsAppClickToChatUrl(phone: string, message: string): string {
  return `https://wa.me/${normalizeIndianPhone(phone)}?text=${encodeURIComponent(message)}`;
}

export async function sendWhatsAppIfConfigured(phone: string, message: string): Promise<{
  status: "SENT" | "LINK_CREATED" | "FAILED";
  clickUrl: string;
  providerResponse?: unknown;
}> {
  const clickUrl = buildWhatsAppClickToChatUrl(phone, message);
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;

  if (!instanceId || !token) {
    return { status: "LINK_CREATED", clickUrl };
  }

  try {
    const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        token,
        to: normalizeIndianPhone(phone),
        body: message,
      }),
    });
    const providerResponse = await response.json().catch(() => null);
    return {
      status: response.ok ? "SENT" : "FAILED",
      clickUrl,
      providerResponse,
    };
  } catch (error) {
    return { status: "FAILED", clickUrl, providerResponse: String(error) };
  }
}
