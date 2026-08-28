"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_URL } from "@/lib/api";

const statusSteps = [
  "PENDING",
  "CONFIRMED",
  "PICKED_UP",
  "PROCESSING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

const statusLabels: Record<string, string> = {
  PENDING: "Order Placed",
  CONFIRMED: "Confirmed",
  PICKED_UP: "Picked Up",
  PROCESSING: "Washing/Ironing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled"
};

export default function OrderDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        // Fetch all orders and find this one (since we don't have a specific GET /orders/:id for customers yet)
        const res = await fetch(`${API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const found = data.data?.find((o: any) => o.id === params.id);
          setOrder(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  if (loading) return <div>Loading order details...</div>;
  if (!order) return <div>Order not found.</div>;

  const currentStepIndex = order.status === "CANCELLED" ? -1 : statusSteps.indexOf(order.status);

  const downloadInvoice = async (invoiceId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${invoiceId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to download invoice");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/orders" className="text-gray-500 hover:text-primary-600 flex items-center gap-2 transition-colors">
          <i className="fa-solid fa-arrow-left"></i> Back to Orders
        </Link>
        {order.invoice?.id && (
          <button 
            onClick={() => downloadInvoice(order.invoice.id)}
            className="btn-primary-sm py-2 px-4 rounded-md flex items-center gap-2 text-white bg-primary-600 hover:bg-primary-700"
          >
            <i className="fa-solid fa-file-pdf"></i> Download Invoice
          </button>
        )}
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
            <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-bold ${
            order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
            order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            {statusLabels[order.status] || order.status}
          </div>
        </div>

        {/* Tracking Progress Bar */}
        {order.status !== "CANCELLED" && (
          <div className="py-8 border-y border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Tracking Status</h3>
            <div className="relative">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
                <div style={{ width: `${Math.max(5, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"></div>
              </div>
              <div className="flex justify-between text-xs font-medium text-gray-500">
                {statusSteps.map((step, idx) => (
                  <div key={step} className={`text-center ${idx <= currentStepIndex ? "text-primary-600 font-bold" : "hidden md:block"}`}>
                    <div className={`w-4 h-4 mx-auto rounded-full mb-1 ${idx <= currentStepIndex ? "bg-primary-500" : "bg-gray-300"}`}></div>
                    {statusLabels[step]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Details</h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium text-gray-900">{order.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quantity</span>
                <span className="font-medium text-gray-900">{order.quantity} {order.service?.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pickup Date</span>
                <span className="font-medium text-gray-900">{order.pickupDate ? new Date(order.pickupDate).toLocaleDateString() : "TBD"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium text-gray-900">{order.paymentMethod}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="text-gray-900 font-bold">Total Amount</span>
                <span className="font-bold text-primary-600 text-lg">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Store Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Address</h3>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-gray-700">{order.address}</p>
                {order.deliveryInstructions && (
                  <p className="text-sm text-gray-500 mt-2"><span className="font-medium">Instructions:</span> {order.deliveryInstructions}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Store Contact</h3>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900">LuxWash Jaipur</h4>
                <p className="text-blue-800 text-sm mt-1">123 Laundry Street, Jaipur, Rajasthan</p>
                <div className="mt-3 space-y-2">
                  <a href="tel:+919663574728" className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium text-sm">
                    <i className="fa-solid fa-phone"></i> +91 9663574728
                  </a>
                  <a href="mailto:support@luxwash.in" className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium text-sm">
                    <i className="fa-solid fa-envelope"></i> support@luxwash.in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Help Action */}
        <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center">
          <Link href="/contactus" className="flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium px-6 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
            <i className="fa-solid fa-headset"></i> Need help with this order? Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
