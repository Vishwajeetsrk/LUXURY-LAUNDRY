"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextInvoiceNumber = nextInvoiceNumber;
exports.createInvoiceFromOrder = createInvoiceFromOrder;
exports.createManualInvoice = createManualInvoice;
exports.listInvoices = listInvoices;
exports.listCustomerInvoices = listCustomerInvoices;
exports.findInvoiceForUser = findInvoiceForUser;
exports.updateInvoiceStatus = updateInvoiceStatus;
exports.archiveInvoice = archiveInvoice;
exports.invoiceAnalytics = invoiceAnalytics;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const invoiceMath_1 = require("./invoiceMath");
const permissions_1 = require("../../lib/permissions");
const invoiceInclude = {
    customer: { select: { id: true, name: true, email: true, phone: true } },
    order: {
        select: {
            id: true,
            address: true,
            pickupDate: true,
            deliveryDate: true,
            status: true,
        },
    },
    items: true,
};
async function nextInvoiceNumber(tx, date = new Date()) {
    const year = date.getFullYear();
    const counter = await tx.invoiceCounter.upsert({
        where: { year },
        create: { year, sequence: 1 },
        update: { sequence: { increment: 1 } },
    });
    return (0, invoiceMath_1.formatInvoiceNumber)(year, counter.sequence);
}
async function createInvoiceFromOrder(orderId, input) {
    return prisma_1.default.$transaction(async (tx) => {
        const existing = await tx.invoice.findUnique({
            where: { orderId },
            include: invoiceInclude,
        });
        if (existing)
            return existing;
        const order = await tx.order.findUnique({
            where: { id: orderId },
            include: {
                customer: { select: { id: true, discountPercentage: true } },
                service: { select: { name: true, unit: true, pricePerUnit: true } },
            },
        });
        if (!order)
            throw Object.assign(new Error("Order not found"), { statusCode: 404 });
        const item = {
            serviceName: order.service.name,
            quantity: order.quantity,
            unit: order.service.unit,
            unitPrice: order.service.pricePerUnit,
            totalPrice: order.quantity * order.service.pricePerUnit,
        };
        // Auto-calculate discount from user profile if not explicitly overridden
        const discountAmount = input.discountAmount ?? (order.customer.discountPercentage > 0
            ? item.totalPrice * (order.customer.discountPercentage / 100)
            : 0);
        const totals = (0, invoiceMath_1.calculateInvoiceTotals)({
            items: [{ quantity: item.quantity, unitPrice: item.unitPrice }],
            deliveryCharge: input.deliveryCharge ?? 0,
            discountAmount: discountAmount,
            gstRate: 18,
        });
        const paymentStatus = input.paymentStatus ?? "UNPAID";
        return tx.invoice.create({
            data: {
                invoiceNumber: await nextInvoiceNumber(tx),
                orderId: order.id,
                customerId: order.customerId,
                subtotal: totals.subtotal,
                taxableAmount: totals.taxableAmount,
                gstRate: 18,
                cgstAmount: totals.cgstAmount,
                sgstAmount: totals.sgstAmount,
                taxAmount: totals.taxAmount,
                discountAmount: discountAmount,
                deliveryCharge: input.deliveryCharge ?? 0,
                totalAmount: totals.totalAmount,
                paymentMethod: input.paymentMethod ?? "CASH",
                paymentStatus,
                invoiceStatus: paymentStatus === "PAID" ? "PAID" : "SENT",
                paidAt: paymentStatus === "PAID" ? new Date() : null,
                notes: input.notes ?? null,
                dueDate: input.dueDate ?? null,
                items: { create: item },
            },
            include: invoiceInclude,
        });
    });
}
async function createManualInvoice(input) {
    return prisma_1.default.$transaction(async (tx) => {
        const customer = await tx.user.findUnique({ where: { id: input.customerId }, select: { id: true, discountPercentage: true } });
        if (!customer)
            throw Object.assign(new Error("Customer not found"), { statusCode: 404 });
        const totalItemsPrice = input.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const discountAmount = input.discountAmount ?? (customer.discountPercentage > 0
            ? totalItemsPrice * (customer.discountPercentage / 100)
            : 0);
        const totals = (0, invoiceMath_1.calculateInvoiceTotals)({
            items: input.items,
            deliveryCharge: input.deliveryCharge ?? 0,
            discountAmount: discountAmount,
            gstRate: 18,
        });
        const paymentStatus = input.paymentStatus ?? "UNPAID";
        return tx.invoice.create({
            data: {
                invoiceNumber: await nextInvoiceNumber(tx),
                customerId: input.customerId,
                subtotal: totals.subtotal,
                taxableAmount: totals.taxableAmount,
                gstRate: 18,
                cgstAmount: totals.cgstAmount,
                sgstAmount: totals.sgstAmount,
                taxAmount: totals.taxAmount,
                discountAmount: discountAmount,
                deliveryCharge: input.deliveryCharge ?? 0,
                totalAmount: totals.totalAmount,
                paymentMethod: input.paymentMethod ?? "CASH",
                paymentStatus,
                invoiceStatus: input.invoiceStatus ?? (paymentStatus === "PAID" ? "PAID" : "DRAFT"),
                paidAt: paymentStatus === "PAID" ? new Date() : null,
                notes: input.notes ?? null,
                dueDate: input.dueDate ?? null,
                items: {
                    create: input.items.map((item) => ({
                        ...item,
                        totalPrice: item.quantity * item.unitPrice,
                    })),
                },
            },
            include: invoiceInclude,
        });
    });
}
function buildInvoiceWhere(query) {
    const where = {};
    if (!query.includeArchived)
        where.archivedAt = null;
    if (query.status)
        where.invoiceStatus = query.status;
    if (query.paymentStatus)
        where.paymentStatus = query.paymentStatus;
    if (query.from || query.to) {
        where.generatedAt = {
            ...(query.from ? { gte: query.from } : {}),
            ...(query.to ? { lte: query.to } : {}),
        };
    }
    if (query.search) {
        where.OR = [
            { invoiceNumber: { contains: query.search, mode: "insensitive" } },
            { customer: { is: { name: { contains: query.search, mode: "insensitive" } } } },
            { customer: { is: { email: { contains: query.search, mode: "insensitive" } } } },
        ];
    }
    return where;
}
async function listInvoices(query) {
    const where = buildInvoiceWhere(query);
    const skip = (query.page - 1) * query.limit;
    const [total, invoices] = await Promise.all([
        prisma_1.default.invoice.count({ where }),
        prisma_1.default.invoice.findMany({
            where,
            skip,
            take: query.limit,
            include: invoiceInclude,
            orderBy: { generatedAt: "desc" },
        }),
    ]);
    return {
        data: invoices,
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
        },
    };
}
async function listCustomerInvoices(customerId) {
    return prisma_1.default.invoice.findMany({
        where: { customerId, archivedAt: null },
        include: invoiceInclude,
        orderBy: { generatedAt: "desc" },
    });
}
async function findInvoiceForUser(invoiceId, user) {
    const invoice = await prisma_1.default.invoice.findFirst({
        where: {
            id: invoiceId,
            archivedAt: null,
            ...((0, permissions_1.hasPermission)(user.role, "invoices:read") ? {} : { customerId: user.id }),
        },
        include: invoiceInclude,
    });
    return invoice;
}
async function updateInvoiceStatus(invoiceId, input) {
    const current = await prisma_1.default.invoice.findUnique({ where: { id: invoiceId } });
    if (!current || current.archivedAt)
        throw Object.assign(new Error("Invoice not found"), { statusCode: 404 });
    if (current.paymentStatus === "PAID" && input.invoiceStatus === "DRAFT") {
        throw Object.assign(new Error("Paid invoices cannot be moved back to draft"), { statusCode: 400 });
    }
    const paymentStatus = input.paymentStatus ?? current.paymentStatus;
    const invoiceStatus = input.invoiceStatus ?? (paymentStatus === "PAID" ? "PAID" : current.invoiceStatus);
    return prisma_1.default.invoice.update({
        where: { id: invoiceId },
        data: {
            paymentStatus,
            paymentMethod: input.paymentMethod,
            invoiceStatus,
            notes: input.notes,
            paidAt: paymentStatus === "PAID" && !current.paidAt ? new Date() : current.paidAt,
        },
        include: invoiceInclude,
    });
}
async function archiveInvoice(invoiceId) {
    const current = await prisma_1.default.invoice.findUnique({ where: { id: invoiceId } });
    if (!current || current.archivedAt)
        throw Object.assign(new Error("Invoice not found"), { statusCode: 404 });
    return prisma_1.default.invoice.update({
        where: { id: invoiceId },
        data: { archivedAt: new Date(), invoiceStatus: "ARCHIVED" },
    });
}
async function invoiceAnalytics(client = prisma_1.default) {
    const [revenue, paid, pending, total, topCustomers] = await Promise.all([
        client.invoice.aggregate({ where: { paymentStatus: "PAID", archivedAt: null }, _sum: { totalAmount: true } }),
        client.invoice.count({ where: { paymentStatus: "PAID", archivedAt: null } }),
        client.invoice.count({ where: { paymentStatus: "UNPAID", archivedAt: null } }),
        client.invoice.count({ where: { archivedAt: null } }),
        client.invoice.groupBy({
            by: ["customerId"],
            where: { archivedAt: null },
            _sum: { totalAmount: true },
            _count: { id: true },
            orderBy: { _sum: { totalAmount: "desc" } },
            take: 5,
        }),
    ]);
    const customers = await client.user.findMany({
        where: { id: { in: topCustomers.map((customer) => customer.customerId) } },
        select: { id: true, name: true, email: true },
    });
    return {
        totalRevenue: revenue._sum.totalAmount ?? 0,
        paidInvoices: paid,
        pendingInvoices: pending,
        totalInvoices: total,
        topCustomers: topCustomers.map((entry) => ({
            customer: customers.find((customer) => customer.id === entry.customerId),
            totalAmount: entry._sum.totalAmount ?? 0,
            invoiceCount: entry._count.id,
        })),
    };
}
//# sourceMappingURL=invoiceService.js.map