export interface WhatsAppOrderSummary {
    id: string;
    customerName: string;
    customerPhone?: string | null;
    address: string;
    services: Array<{
        name: string;
        quantity: number;
        unit: string;
    }>;
    pickupDate?: Date | string | null;
    paymentMethod: string;
    totalAmount: number;
    deliveryInstructions?: string | null;
    notes?: string | null;
}
export declare function normalizeIndianPhone(phone: string): string;
export declare function buildAdminOrderMessage(order: WhatsAppOrderSummary): string;
export declare function buildCustomerOrderMessage(order: WhatsAppOrderSummary): string;
export declare function buildWhatsAppClickToChatUrl(phone: string, message: string): string;
export declare function sendWhatsAppIfConfigured(phone: string, message: string): Promise<{
    status: "SENT" | "LINK_CREATED" | "FAILED";
    clickUrl: string;
    providerResponse?: unknown;
}>;
//# sourceMappingURL=whatsapp.d.ts.map