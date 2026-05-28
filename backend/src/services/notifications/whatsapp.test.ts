import { describe, expect, it } from "vitest";
import { buildAdminOrderMessage, buildWhatsAppClickToChatUrl, normalizeIndianPhone } from "./whatsapp";

describe("WhatsApp notifications", () => {
  const order = {
    id: "LW1025",
    customerName: "Rahul Sharma",
    customerPhone: "+91 98765 43210",
    address: "Shop No. 504, Bagrota, Ajmer Road, Jaipur",
    services: [{ name: "Wash & Fold", quantity: 3, unit: "kg" }],
    pickupDate: new Date("2026-05-29T10:00:00.000Z"),
    paymentMethod: "Cash on Delivery",
    totalAmount: 780,
    notes: "Please deliver before Sunday",
  };

  it("normalizes Indian phone numbers for WhatsApp click links", () => {
    expect(normalizeIndianPhone("+91 96635 74728")).toBe("919663574728");
    expect(normalizeIndianPhone("9663574728")).toBe("919663574728");
  });

  it("builds an admin order alert with the operational order details", () => {
    const message = buildAdminOrderMessage(order);

    expect(message).toContain("New Order Received");
    expect(message).toContain("Order ID: #LW1025");
    expect(message).toContain("Name: Rahul Sharma");
    expect(message).toContain("Wash & Fold - 3 kg");
    expect(message).toContain("Payment: Cash on Delivery");
    expect(message).toContain("Total: Rs. 780");
  });

  it("creates an encoded WhatsApp click-to-chat URL", () => {
    const url = buildWhatsAppClickToChatUrl("+91-9663574728", "Hello LuxWash");

    expect(url).toBe("https://wa.me/919663574728?text=Hello%20LuxWash");
  });
});
