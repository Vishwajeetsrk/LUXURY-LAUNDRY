"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest, currency, downloadInvoicePdf, Invoice } from "@/lib/invoices";

export default function InvoiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<Invoice>(`/api/invoices/${params.id}`)
      .then(setInvoice)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load invoice"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const shareWhatsApp = async () => {
    if (!invoice) return;
    try {
      const data = await apiRequest<{ url: string }>(`/api/invoices/${invoice.id}/whatsapp-url`);
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create WhatsApp link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container-custom max-w-5xl">
          <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
            <div className="h-8 w-48 skeleton rounded mb-6" />
            <div className="h-80 w-full skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container-custom max-w-xl text-center bg-white rounded-xl border border-gray-100 p-10 shadow-sm">
          <h1 className="text-2xl font-black text-gray-900">Invoice unavailable</h1>
          <p className="text-gray-500 mt-2">{error || "Invoice not found"}</p>
          <button onClick={() => router.back()} className="btn btn-primary mt-6">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 print:bg-white">
      <div className="container-custom max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 print:hidden">
          <Link href="/invoices" className="text-sm text-primary-600 font-semibold">
            <i className="fa-solid fa-arrow-left mr-2" />
            Back to invoices
          </Link>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="btn btn-outline py-2">
              <i className="fa-solid fa-print mr-2" />
              Print
            </button>
            <button onClick={() => downloadInvoicePdf(invoice)} className="btn btn-primary py-2">
              <i className="fa-solid fa-download mr-2" />
              PDF
            </button>
            <button onClick={shareWhatsApp} className="btn bg-green-600 hover:bg-green-700 text-white py-2">
              <i className="fa-brands fa-whatsapp mr-2" />
              Share
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border-0">
          <div className="bg-primary-600 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center mb-4">
                <i className="fa-solid fa-shirt text-xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">LuxWash Premium Laundry</h1>
              <p className="text-primary-100 text-sm mt-1">Shop No. 504, Bagrota, Ajmer Road, Jaipur</p>
              <p className="text-primary-100 text-sm">+91-9663574728 | support@luxwash.com</p>
            </div>
            <div className="sm:text-right">
              <p className="text-primary-100 text-sm">Invoice</p>
              <p className="text-xl font-black font-mono">{invoice.invoiceNumber}</p>
              <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-white/15 text-sm font-semibold">{invoice.paymentStatus}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-xs uppercase font-bold text-gray-400">Bill To</p>
                <h2 className="text-lg font-black text-gray-900 mt-2">{invoice.customer.name}</h2>
                <p className="text-sm text-gray-500">{invoice.customer.email}</p>
                <p className="text-sm text-gray-500">{invoice.customer.phone || "Phone not provided"}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-400">Pickup Address</p>
                <p className="text-sm text-gray-700 mt-2">{invoice.order?.address || "Manual invoice"}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-400">Details</p>
                <div className="text-sm text-gray-700 mt-2 space-y-1">
                  <p>Date: {new Date(invoice.generatedAt).toLocaleDateString("en-IN")}</p>
                  <p>Order: {invoice.orderId || "Manual"}</p>
                  <p>Payment: {invoice.paymentMethod.replace(/_/g, " ")}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full admin-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold text-gray-900">{item.serviceName}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{currency(item.unitPrice)}</td>
                      <td className="font-bold">{currency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-base font-black text-gray-900 mb-3">GST & Terms</h3>
                <p className="text-sm text-gray-600">18% GST is split as 9% CGST and 9% SGST. Delivery charge is included in taxable value. Paid invoices are locked for accounting records.</p>
                {invoice.notes && <p className="text-sm text-gray-600 mt-3">Notes: {invoice.notes}</p>}
              </div>
              <div className="space-y-3">
                {[
                  ["Subtotal", invoice.subtotal],
                  ["Delivery", invoice.deliveryCharge],
                  ["Discount", -invoice.discountAmount],
                  ["Taxable Amount", invoice.taxableAmount],
                  [`CGST ${invoice.gstRate / 2}%`, invoice.cgstAmount],
                  [`SGST ${invoice.gstRate / 2}%`, invoice.sgstAmount],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm text-gray-600">
                    <span>{label}</span>
                    <span>{currency(Number(value))}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xl font-black text-white bg-primary-600 rounded-lg px-4 py-3">
                  <span>Grand Total</span>
                  <span>{currency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
