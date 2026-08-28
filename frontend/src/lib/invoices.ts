import { API_URL } from "./api";
export { API_URL };

export interface InvoiceItem {
  id: string;
  serviceName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId?: string | null;
  subtotal: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  taxAmount: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  invoiceStatus: string;
  notes?: string | null;
  generatedAt: string;
  paidAt?: string | null;
  dueDate?: string | null;
  customer: { id: string; name: string; email: string; phone?: string | null };
  order?: { id: string; address: string; pickupDate?: string | null; deliveryDate?: string | null; status: string } | null;
  items: InvoiceItem[];
}

export function currency(value: number): string {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Request failed");
  }
  return res.json();
}

export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/invoices/${invoice.id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Unable to download invoice PDF");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoice.invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
