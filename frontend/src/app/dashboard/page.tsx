"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

export default function DashboardOverview() {
  const [stats, setStats] = useState({ totalOrders: 0, activeOrders: 0, totalSpent: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/api/orders?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const orders = data.data || [];
          setRecentOrders(orders);
          setStats({
            totalOrders: data.meta?.total || orders.length,
            activeOrders: orders.filter((o: any) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length,
            totalSpent: orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0)
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

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
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
            <i className="fa-solid fa-box"></i>
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Total Orders</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-xl">
            <i className="fa-solid fa-spinner"></i>
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Active Orders</div>
            <div className="text-2xl font-bold text-gray-900">{stats.activeOrders}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-xl">
            <i className="fa-solid fa-indian-rupee-sign"></i>
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Total Spent</div>
            <div className="text-2xl font-bold text-gray-900">₹{stats.totalSpent}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-primary-600 font-medium hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="py-3 px-6 font-medium">Order ID</th>
                <th className="py-3 px-6 font-medium">Service</th>
                <th className="py-3 px-6 font-medium">Date</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-4 px-6 text-gray-600">{order.service?.name}</td>
                    <td className="py-4 px-6 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                        order.status === "PROCESSING" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium flex items-center justify-between">
                      ₹{order.totalAmount}
                      {order.invoice?.id && (
                        <button 
                          onClick={() => downloadInvoice(order.invoice.id)}
                          className="text-primary-600 hover:text-primary-800"
                          title="Download Invoice"
                        >
                          <i className="fa-solid fa-file-pdf"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
