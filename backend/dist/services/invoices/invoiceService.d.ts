import { Prisma, PrismaClient } from "@prisma/client";
export interface AuthUser {
    id: string;
    role: string;
}
export interface InvoiceListQuery {
    page: number;
    limit: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
    from?: Date;
    to?: Date;
    includeArchived?: boolean;
}
type DbClient = Prisma.TransactionClient | PrismaClient;
export declare function nextInvoiceNumber(tx: Prisma.TransactionClient, date?: Date): Promise<string>;
export declare function createInvoiceFromOrder(orderId: string, input: {
    deliveryCharge?: number;
    discountAmount?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    notes?: string;
    dueDate?: Date;
}): Promise<{
    order: {
        id: string;
        status: string;
        pickupDate: Date | null;
        deliveryDate: Date | null;
        address: string;
    } | null;
    customer: {
        name: string;
        id: string;
        email: string;
        phone: string | null;
    };
    items: {
        id: string;
        createdAt: Date;
        quantity: number;
        unit: string;
        invoiceId: string;
        serviceName: string;
        unitPrice: number;
        totalPrice: number;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    customerId: string;
    totalAmount: number;
    paymentMethod: string;
    notes: string | null;
    invoiceNumber: string;
    orderId: string | null;
    subtotal: number;
    taxableAmount: number;
    gstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    taxAmount: number;
    discountAmount: number;
    deliveryCharge: number;
    paymentStatus: string;
    invoiceStatus: string;
    generatedAt: Date;
    paidAt: Date | null;
    dueDate: Date | null;
    archivedAt: Date | null;
}>;
export declare function createManualInvoice(input: {
    customerId: string;
    items: Array<{
        serviceName: string;
        quantity: number;
        unit: string;
        unitPrice: number;
    }>;
    deliveryCharge?: number;
    discountAmount?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    invoiceStatus?: string;
    notes?: string;
    dueDate?: Date;
}): Promise<{
    order: {
        id: string;
        status: string;
        pickupDate: Date | null;
        deliveryDate: Date | null;
        address: string;
    } | null;
    customer: {
        name: string;
        id: string;
        email: string;
        phone: string | null;
    };
    items: {
        id: string;
        createdAt: Date;
        quantity: number;
        unit: string;
        invoiceId: string;
        serviceName: string;
        unitPrice: number;
        totalPrice: number;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    customerId: string;
    totalAmount: number;
    paymentMethod: string;
    notes: string | null;
    invoiceNumber: string;
    orderId: string | null;
    subtotal: number;
    taxableAmount: number;
    gstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    taxAmount: number;
    discountAmount: number;
    deliveryCharge: number;
    paymentStatus: string;
    invoiceStatus: string;
    generatedAt: Date;
    paidAt: Date | null;
    dueDate: Date | null;
    archivedAt: Date | null;
}>;
export declare function listInvoices(query: InvoiceListQuery): Promise<{
    data: ({
        order: {
            id: string;
            status: string;
            pickupDate: Date | null;
            deliveryDate: Date | null;
            address: string;
        } | null;
        customer: {
            name: string;
            id: string;
            email: string;
            phone: string | null;
        };
        items: {
            id: string;
            createdAt: Date;
            quantity: number;
            unit: string;
            invoiceId: string;
            serviceName: string;
            unitPrice: number;
            totalPrice: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        customerId: string;
        totalAmount: number;
        paymentMethod: string;
        notes: string | null;
        invoiceNumber: string;
        orderId: string | null;
        subtotal: number;
        taxableAmount: number;
        gstRate: number;
        cgstAmount: number;
        sgstAmount: number;
        taxAmount: number;
        discountAmount: number;
        deliveryCharge: number;
        paymentStatus: string;
        invoiceStatus: string;
        generatedAt: Date;
        paidAt: Date | null;
        dueDate: Date | null;
        archivedAt: Date | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function listCustomerInvoices(customerId: string): Promise<({
    order: {
        id: string;
        status: string;
        pickupDate: Date | null;
        deliveryDate: Date | null;
        address: string;
    } | null;
    customer: {
        name: string;
        id: string;
        email: string;
        phone: string | null;
    };
    items: {
        id: string;
        createdAt: Date;
        quantity: number;
        unit: string;
        invoiceId: string;
        serviceName: string;
        unitPrice: number;
        totalPrice: number;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    customerId: string;
    totalAmount: number;
    paymentMethod: string;
    notes: string | null;
    invoiceNumber: string;
    orderId: string | null;
    subtotal: number;
    taxableAmount: number;
    gstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    taxAmount: number;
    discountAmount: number;
    deliveryCharge: number;
    paymentStatus: string;
    invoiceStatus: string;
    generatedAt: Date;
    paidAt: Date | null;
    dueDate: Date | null;
    archivedAt: Date | null;
})[]>;
export declare function findInvoiceForUser(invoiceId: string, user: AuthUser): Promise<({
    order: {
        id: string;
        status: string;
        pickupDate: Date | null;
        deliveryDate: Date | null;
        address: string;
    } | null;
    customer: {
        name: string;
        id: string;
        email: string;
        phone: string | null;
    };
    items: {
        id: string;
        createdAt: Date;
        quantity: number;
        unit: string;
        invoiceId: string;
        serviceName: string;
        unitPrice: number;
        totalPrice: number;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    customerId: string;
    totalAmount: number;
    paymentMethod: string;
    notes: string | null;
    invoiceNumber: string;
    orderId: string | null;
    subtotal: number;
    taxableAmount: number;
    gstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    taxAmount: number;
    discountAmount: number;
    deliveryCharge: number;
    paymentStatus: string;
    invoiceStatus: string;
    generatedAt: Date;
    paidAt: Date | null;
    dueDate: Date | null;
    archivedAt: Date | null;
}) | null>;
export declare function updateInvoiceStatus(invoiceId: string, input: {
    paymentStatus?: string;
    paymentMethod?: string;
    invoiceStatus?: string;
    notes?: string;
}): Promise<{
    order: {
        id: string;
        status: string;
        pickupDate: Date | null;
        deliveryDate: Date | null;
        address: string;
    } | null;
    customer: {
        name: string;
        id: string;
        email: string;
        phone: string | null;
    };
    items: {
        id: string;
        createdAt: Date;
        quantity: number;
        unit: string;
        invoiceId: string;
        serviceName: string;
        unitPrice: number;
        totalPrice: number;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    customerId: string;
    totalAmount: number;
    paymentMethod: string;
    notes: string | null;
    invoiceNumber: string;
    orderId: string | null;
    subtotal: number;
    taxableAmount: number;
    gstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    taxAmount: number;
    discountAmount: number;
    deliveryCharge: number;
    paymentStatus: string;
    invoiceStatus: string;
    generatedAt: Date;
    paidAt: Date | null;
    dueDate: Date | null;
    archivedAt: Date | null;
}>;
export declare function archiveInvoice(invoiceId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    customerId: string;
    totalAmount: number;
    paymentMethod: string;
    notes: string | null;
    invoiceNumber: string;
    orderId: string | null;
    subtotal: number;
    taxableAmount: number;
    gstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    taxAmount: number;
    discountAmount: number;
    deliveryCharge: number;
    paymentStatus: string;
    invoiceStatus: string;
    generatedAt: Date;
    paidAt: Date | null;
    dueDate: Date | null;
    archivedAt: Date | null;
}>;
export declare function invoiceAnalytics(client?: DbClient): Promise<{
    totalRevenue: number;
    paidInvoices: number;
    pendingInvoices: number;
    totalInvoices: number;
    topCustomers: {
        customer: {
            name: string;
            id: string;
            email: string;
        } | undefined;
        totalAmount: number;
        invoiceCount: number;
    }[];
}>;
export {};
//# sourceMappingURL=invoiceService.d.ts.map