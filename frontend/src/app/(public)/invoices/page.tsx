"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, currency, downloadInvoicePdf, Invoice } from "@/lib/invoices";

const statusTone: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  UNPAID: "bg-amber-100 text-amber-700",
  PARTIAL: "bg-blue-100 text-blue-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<Invoice[]>("/api/invoices/customer/me")
      .then(setInvoices)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load invoices"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900">My Invoices</h1>
            <p className="text-sm text-gray-500 mt-1">View GST-ready invoices, download PDFs, and share details on WhatsApp.</p>
          </div>
          <Link href="/shop" className="btn btn-primary">
            <i className="fa-solid fa-repeat mr-2" />
            Reorder
          </Link>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {loading ? [...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="h-5 w-32 skeleton rounded mb-4" />
              <div className="h-8 w-24 skeleton rounded mb-3" />
              <div className="h-4 w-full skeleton rounded" />
            </div>
          )) : invoices.length ? invoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-gray-500">{invoice.invoiceNumber}</p>
                  <p className="text-xl font-black text-gray-900 mt-1">{currency(invoice.totalAmount)}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusTone[invoice.paymentStatus] || "bg-gray-100 text-gray-700"}`}>
                  {invoice.paymentStatus}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Date</span><span>{new Date(invoice.generatedAt).toLocaleDateString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Payment</span><span>{invoice.paymentMethod.replace(/_/g, " ")}</span></div>
                <div className="flex justify-between"><span>Items</span><span>{invoice.items.length}</span></div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link href={`/invoices/${invoice.id}`} className="btn btn-outline py-2 text-xs">View</Link>
                <button onClick={() => downloadInvoicePdf(invoice)} className="btn btn-primary py-2 text-xs">Download</button>
              </div>
            </div>
          )) : (
            <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-file-invoice text-primary-500 text-2xl" />
              </div>
              <p className="text-xl font-black text-gray-900">No invoices yet</p>
              <p className="text-gray-500 text-sm mt-2">Your invoices will appear here after you place an order.</p>
              <Link href="/shop" className="btn btn-primary mt-6">Browse Services</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
