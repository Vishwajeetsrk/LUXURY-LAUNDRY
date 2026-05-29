import { Prisma, PrismaClient } from "@prisma/client";
import prisma from "../../lib/prisma";
import { calculateInvoiceTotals, formatInvoiceNumber } from "./invoiceMath";

import { hasPermission } from "../../lib/permissions";

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
} satisfies Prisma.InvoiceInclude;

export async function nextInvoiceNumber(tx: Prisma.TransactionClient, date = new Date()): Promise<string> {
  const year = date.getFullYear();
  const counter = await tx.invoiceCounter.upsert({
    where: { year },
    create: { year, sequence: 1 },
    update: { sequence: { increment: 1 } },
  });

  return formatInvoiceNumber(year, counter.sequence);
}

export async function createInvoiceFromOrder(
  orderId: string,
  input: {
    deliveryCharge?: number;
    discountAmount?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    notes?: string;
    dueDate?: Date;
    useWallet?: boolean;
  },
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.invoice.findUnique({
      where: { orderId },
      include: invoiceInclude,
    });
    if (existing) return existing;

    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { id: true, discountPercentage: true, walletBalance: true } },
        service: { select: { name: true, unit: true, pricePerUnit: true } },
      },
    });
    if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404 });

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

    const totals = calculateInvoiceTotals({
      items: [{ quantity: item.quantity, unitPrice: item.unitPrice }],
      deliveryCharge: input.deliveryCharge ?? 0,
      discountAmount: discountAmount,
      gstRate: 18,
    });
    let paymentStatus = input.paymentStatus ?? "UNPAID";
    let paymentMethod = input.paymentMethod ?? "CASH";
    let walletDeducted = 0;

    if (input.useWallet && order.customer.walletBalance > 0) {
      // Calculate max automatic discount (20% cap)
      const maxDiscount = totals.totalAmount * 0.20;
      let finalTotal = totals.totalAmount;

      if (order.customer.walletBalance >= finalTotal) {
        walletDeducted = finalTotal;
        paymentStatus = "PAID";
        paymentMethod = "WALLET";
      } else {
        walletDeducted = order.customer.walletBalance;
        paymentStatus = "PARTIAL";
      }

      await tx.user.update({
        where: { id: order.customerId },
        data: { walletBalance: { decrement: walletDeducted } }
      });

      await tx.walletTransaction.create({
        data: {
          userId: order.customerId,
          amount: walletDeducted,
          type: "DEBIT",
          description: `Paid for Order #${orderId.slice(0, 8).toUpperCase()}`
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: { walletAmountUsed: walletDeducted }
      });
    }

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
        paymentMethod,
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

export async function createManualInvoice(input: {
  customerId: string;
  items: Array<{ serviceName: string; quantity: number; unit: string; unitPrice: number }>;
  deliveryCharge?: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  invoiceStatus?: string;
  notes?: string;
  dueDate?: Date;
}) {
  return prisma.$transaction(async (tx) => {
    const customer = await tx.user.findUnique({ where: { id: input.customerId }, select: { id: true, discountPercentage: true } });
    if (!customer) throw Object.assign(new Error("Customer not found"), { statusCode: 404 });

    const totalItemsPrice = input.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountAmount = input.discountAmount ?? (customer.discountPercentage > 0
      ? Math.min(totalItemsPrice * (customer.discountPercentage / 100), totalItemsPrice * 0.20) // Cap automatic discount at 20%
      : 0);

    const totals = calculateInvoiceTotals({
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

function buildInvoiceWhere(query: InvoiceListQuery): Prisma.InvoiceWhereInput {
  const where: Prisma.InvoiceWhereInput = {};

  if (!query.includeArchived) where.archivedAt = null;
  if (query.status) where.invoiceStatus = query.status;
  if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
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

export async function listInvoices(query: InvoiceListQuery) {
  const where = buildInvoiceWhere(query);
  const skip = (query.page - 1) * query.limit;

  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
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

export async function listCustomerInvoices(customerId: string) {
  return prisma.invoice.findMany({
    where: { customerId, archivedAt: null },
    include: invoiceInclude,
    orderBy: { generatedAt: "desc" },
  });
}

export async function findInvoiceForUser(invoiceId: string, user: AuthUser) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      archivedAt: null,
      ...(hasPermission(user.role, "invoices:read") ? {} : { customerId: user.id }),
    },
    include: invoiceInclude,
  });

  return invoice;
}

export async function updateInvoiceStatus(
  invoiceId: string,
  input: { paymentStatus?: string; paymentMethod?: string; invoiceStatus?: string; notes?: string },
) {
  const current = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!current || current.archivedAt) throw Object.assign(new Error("Invoice not found"), { statusCode: 404 });
  if (current.paymentStatus === "PAID" && input.invoiceStatus === "DRAFT") {
    throw Object.assign(new Error("Paid invoices cannot be moved back to draft"), { statusCode: 400 });
  }

  const paymentStatus = input.paymentStatus ?? current.paymentStatus;
  const invoiceStatus = input.invoiceStatus ?? (paymentStatus === "PAID" ? "PAID" : current.invoiceStatus);

  return prisma.invoice.update({
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

export async function archiveInvoice(invoiceId: string) {
  const current = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!current || current.archivedAt) throw Object.assign(new Error("Invoice not found"), { statusCode: 404 });

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { archivedAt: new Date(), invoiceStatus: "ARCHIVED" },
  });
}

export async function invoiceAnalytics(client: DbClient = prisma) {
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
