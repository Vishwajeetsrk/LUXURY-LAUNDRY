"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const whatsapp_1 = require("./whatsapp");
(0, vitest_1.describe)("WhatsApp notifications", () => {
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
    (0, vitest_1.it)("normalizes Indian phone numbers for WhatsApp click links", () => {
        (0, vitest_1.expect)((0, whatsapp_1.normalizeIndianPhone)("+91 96635 74728")).toBe("919663574728");
        (0, vitest_1.expect)((0, whatsapp_1.normalizeIndianPhone)("9663574728")).toBe("919663574728");
    });
    (0, vitest_1.it)("builds an admin order alert with the operational order details", () => {
        const message = (0, whatsapp_1.buildAdminOrderMessage)(order);
        (0, vitest_1.expect)(message).toContain("New Order Received");
        (0, vitest_1.expect)(message).toContain("Order ID: #LW1025");
        (0, vitest_1.expect)(message).toContain("Name: Rahul Sharma");
        (0, vitest_1.expect)(message).toContain("Wash & Fold - 3 kg");
        (0, vitest_1.expect)(message).toContain("Payment: Cash on Delivery");
        (0, vitest_1.expect)(message).toContain("Total: Rs. 780");
    });
    (0, vitest_1.it)("creates an encoded WhatsApp click-to-chat URL", () => {
        const url = (0, whatsapp_1.buildWhatsAppClickToChatUrl)("+91-9663574728", "Hello LuxWash");
        (0, vitest_1.expect)(url).toBe("https://wa.me/919663574728?text=Hello%20LuxWash");
    });
});
//# sourceMappingURL=whatsapp.test.js.map