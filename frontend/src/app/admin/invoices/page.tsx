"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest, currency, downloadInvoicePdf, Invoice } from "@/lib/invoices";

const paymentStatuses = ["ALL", "UNPAID", "PAID", "PARTIAL", "REFUNDED"];
const invoiceStatuses = ["ALL", "DRAFT", "SENT", "PAID", "CANCELLED", "ARCHIVED"];

interface InvoiceResponse {
  data: Invoice[];
  pagination: { page: number; total: number; totalPages: number };
}

interface Analytics {
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalInvoices: number;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [invoiceStatus, setInvoiceStatus] = useState("ALL");
  const [orderId, setOrderId] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({
    customerId: "",
    serviceName: "",
    quantity: "1",
    unit: "piece",
    unitPrice: "",
    deliveryCharge: "0",
    discountAmount: "0",
  });

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: "1", limit: "50" });
    if (search.trim()) params.set("search", search.trim());
    if (paymentStatus !== "ALL") params.set("paymentStatus", paymentStatus);
    if (invoiceStatus !== "ALL") params.set("status", invoiceStatus);
    return params.toString();
  }, [search, paymentStatus, invoiceStatus]);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [invoiceData, analyticsData] = await Promise.all([
        apiRequest<InvoiceResponse>(`/api/invoices?${query}`),
        apiRequest<Analytics>("/api/invoices/analytics"),
      ]);
      setInvoices(invoiceData.data);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load invoices");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvoices();
  }, [loadInvoices]);

  const createFromOrder = async () => {
    if (!orderId.trim()) return;
    try {
      await apiRequest(`/api/invoices/create/${orderId.trim()}`, {
        method: "POST",
        body: JSON.stringify({ paymentMethod: "CASH", paymentStatus: "UNPAID" }),
      });
      setToast("Invoice generated from order");
      setOrderId("");
      loadInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create invoice");
    }
  };

  const createManualInvoice = async () => {
    try {
      await apiRequest("/api/invoices/manual", {
        method: "POST",
        body: JSON.stringify({
          customerId: manual.customerId,
          deliveryCharge: Number(manual.deliveryCharge || 0),
          discountAmount: Number(manual.discountAmount || 0),
          paymentMethod: "CASH",
          paymentStatus: "UNPAID",
          items: [{
            serviceName: manual.serviceName,
            quantity: Number(manual.quantity || 1),
            unit: manual.unit,
            unitPrice: Number(manual.unitPrice || 0),
          }],
        }),
      });
      setToast("Manual invoice created");
      setManual({ customerId: "", serviceName: "", quantity: "1", unit: "piece", unitPrice: "", deliveryCharge: "0", discountAmount: "0" });
      setManualOpen(false);
      loadInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create manual invoice");
    }
  };

  const updatePayment = async (invoice: Invoice, nextStatus: string) => {
    try {
      const updated = await apiRequest<Invoice>(`/api/invoices/${invoice.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });
      setInvoices((prev) => prev.map((item) => (item.id === invoice.id ? updated : item)));
      setToast(`Invoice ${updated.invoiceNumber} updated`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update invoice");
    }
  };

  const archiveInvoice = async (invoice: Invoice) => {
    if (!confirm(`Archive ${invoice.invoiceNumber}? It will remain in records but disappear from active lists.`)) return;
    try {
      await apiRequest(`/api/invoices/${invoice.id}`, { method: "DELETE" });
      setInvoices((prev) => prev.filter((item) => item.id !== invoice.id));
      setToast("Invoice archived");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to archive invoice");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">GST-ready invoices, PDF downloads, and cash/manual UPI tracking.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="form-input py-2" placeholder="Order ID for invoice" />
          <button onClick={createFromOrder} className="btn btn-primary whitespace-nowrap">
            <i className="fa-solid fa-file-circle-plus mr-2" />
            Create from Order
          </button>
        </div>
      </div>

      {toast && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{toast}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ["Revenue", currency(analytics?.totalRevenue || 0), "fa-indian-rupee-sign", "bg-green-50 text-green-600"],
          ["Paid", analytics?.paidInvoices || 0, "fa-circle-check", "bg-blue-50 text-blue-600"],
          ["Pending", analytics?.pendingInvoices || 0, "fa-clock", "bg-amber-50 text-amber-600"],
          ["Total Invoices", analytics?.totalInvoices || 0, "fa-file-invoice", "bg-primary-50 text-primary-600"],
        ].map(([label, value, icon, tone]) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tone}`}>
              <i className={`fa-solid ${icon}`} />
            </div>
            <div className="mt-4 text-2xl font-black text-gray-900">{loading ? <div className="h-7 w-24 skeleton rounded" /> : value}</div>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="form-input py-2" placeholder="Search invoice, customer, email" />
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="form-input py-2">
            {paymentStatuses.map((status) => <option key={status} value={status}>{status.replace(/_/g, " ")}</option>)}
          </select>
          <select value={invoiceStatus} onChange={(e) => setInvoiceStatus(e.target.value)} className="form-input py-2">
            {invoiceStatuses.map((status) => <option key={status} value={status}>{status.replace(/_/g, " ")}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <button onClick={() => setManualOpen((open) => !open)} className="flex w-full items-center justify-between text-left font-bold text-gray-900">
          <span><i className="fa-solid fa-receipt text-primary-500 mr-2" />Manual walk-in invoice</span>
          <i className={`fa-solid fa-chevron-${manualOpen ? "up" : "down"} text-gray-400`} />
        </button>
        {manualOpen && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
            <input value={manual.customerId} onChange={(e) => setManual({ ...manual, customerId: e.target.value })} className="form-input py-2" placeholder="Customer ID" />
            <input value={manual.serviceName} onChange={(e) => setManual({ ...manual, serviceName: e.target.value })} className="form-input py-2" placeholder="Service name" />
            <input value={manual.quantity} onChange={(e) => setManual({ ...manual, quantity: e.target.value })} className="form-input py-2" type="number" min="0.1" step="0.1" placeholder="Qty" />
            <input value={manual.unit} onChange={(e) => setManual({ ...manual, unit: e.target.value })} className="form-input py-2" placeholder="Unit" />
            <input value={manual.unitPrice} onChange={(e) => setManual({ ...manual, unitPrice: e.target.value })} className="form-input py-2" type="number" min="0" placeholder="Unit price" />
            <input value={manual.deliveryCharge} onChange={(e) => setManual({ ...manual, deliveryCharge: e.target.value })} className="form-input py-2" type="number" min="0" placeholder="Delivery" />
            <input value={manual.discountAmount} onChange={(e) => setManual({ ...manual, discountAmount: e.target.value })} className="form-input py-2" type="number" min="0" placeholder="Discount" />
            <button onClick={createManualInvoice} className="btn btn-primary">
              <i className="fa-solid fa-plus mr-2" />
              Create Manual
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, row) => (
                <tr key={row}>{[...Array(7)].map((__, cell) => <td key={cell}><div className="h-4 w-20 skeleton rounded" /></td>)}</tr>
              )) : invoices.length ? invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-mono text-xs">{invoice.invoiceNumber}</td>
                  <td>
                    <div className="font-semibold text-gray-900">{invoice.customer.name}</div>
                    <div className="text-xs text-gray-400">{invoice.customer.email}</div>
                  </td>
                  <td className="font-bold text-gray-900">{currency(invoice.totalAmount)}</td>
                  <td>
                    <select value={invoice.paymentStatus} onChange={(e) => updatePayment(invoice, e.target.value)} className="form-input py-1 text-xs w-28">
                      {paymentStatuses.filter((status) => status !== "ALL").map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td><span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{invoice.invoiceStatus}</span></td>
                  <td className="text-xs text-gray-500">{new Date(invoice.generatedAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link href={`/invoices/${invoice.id}`} className="text-primary-600 text-xs font-semibold">View</Link>
                      <button onClick={() => downloadInvoicePdf(invoice)} className="text-green-600 text-xs font-semibold">PDF</button>
                      <button onClick={() => archiveInvoice(invoice)} className="text-red-500 text-xs font-semibold">Archive</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="text-center text-gray-400 py-12">No invoices found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
