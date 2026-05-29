"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io, Socket } from "socket.io-client";

interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  totalServices: number;
  pendingOrders: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    serviceName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
  chartData?: Array<{ month: string; revenue: number }>;
}

const statCards = [
  { key: "totalOrders", label: "Total Orders", icon: "fa-solid fa-box", color: "bg-primary-500", textColor: "text-primary-600", bgLight: "bg-primary-50" },
  { key: "totalCustomers", label: "Customers", icon: "fa-solid fa-users", color: "bg-green-500", textColor: "text-green-600", bgLight: "bg-green-50" },
  { key: "totalRevenue", label: "Revenue", icon: "fa-solid fa-indian-rupee-sign", color: "bg-amber-500", textColor: "text-amber-600", bgLight: "bg-amber-50", prefix: "₹" },
  { key: "totalServices", label: "Services", icon: "fa-solid fa-concierge-bell", color: "bg-purple-500", textColor: "text-purple-600", bgLight: "bg-purple-50" },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PICKED_UP: "bg-indigo-100 text-indigo-800",
  PROCESSING: "bg-cyan-100 text-cyan-800",
  READY: "bg-teal-100 text-teal-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalServices: 5,
    pendingOrders: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const handleDownloadReport = (type: "pdf" | "excel") => {
    const token = localStorage.getItem("token");
    let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/reports/${type}?token=${token}`;
    if (dateRange.startDate && dateRange.endDate) {
      url += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
    }
    
    // Using fetch to download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error("Export failed");
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders_report_${new Date().toISOString().split('T')[0]}.${type === "pdf" ? "pdf" : "xlsx"}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => {
        console.error(err);
        alert("Failed to download report");
      });
  };

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/dashboard/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Set up Socket.IO connection for real-time updates
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("token");
    
    let socket: Socket;
    if (token) {
      socket = io(API_URL, {
        auth: { token }
      });

      socket.on("connect", () => {
        console.log("Connected to real-time updates");
      });

      socket.on("dashboardUpdate", (data) => {
        console.log("Dashboard updated via websocket!");
        if (data.type === 'NEW_ORDER' || data.type === 'ORDER_STATUS_CHANGED') {
          // Re-fetch stats when orders change
          fetchStats();
        }
      });
    }

    // Fallback polling just in case socket disconnects
    const pollInterval = setInterval(() => {
      fetchStats();
    }, 30000); // 30s polling fallback

    return () => {
      if (socket) socket.disconnect();
      clearInterval(pollInterval);
    };
  }, [fetchStats]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here&apos;s your business overview.</p>
        </div>
        
        {/* Reports Download */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              className="border rounded px-2 py-1.5 text-sm"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
            <span className="text-gray-400">to</span>
            <input 
              type="date" 
              className="border rounded px-2 py-1.5 text-sm"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => handleDownloadReport('pdf')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold text-sm transition-colors"
            >
              <i className="fa-solid fa-file-pdf"></i> PDF
            </button>
            <button 
              onClick={() => handleDownloadReport('excel')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 font-semibold text-sm transition-colors"
            >
              <i className="fa-solid fa-file-excel"></i> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.key} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.bgLight} rounded-lg flex items-center justify-center`}>
                <i className={`${card.icon} ${card.textColor}`} />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <i className="fa-solid fa-arrow-up text-[10px] mr-0.5" />
                12%
              </span>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {loading ? (
                <div className="h-8 w-20 skeleton rounded" />
              ) : (
                <>
                  {card.prefix || ""}
                  {(stats as any)[card.key]?.toLocaleString() || 0}
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions + Pending Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/admin/orders" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200 text-sm font-medium text-gray-700">
              <i className="fa-solid fa-plus w-4 text-center" />
              View All Orders
            </Link>
            <Link href="/admin/invoices" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200 text-sm font-medium text-gray-700">
              <i className="fa-solid fa-file-invoice w-4 text-center" />
              Manage Invoices
            </Link>
            <Link href="/admin/whatsapp" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200 text-sm font-medium text-gray-700">
              <i className="fa-brands fa-whatsapp w-4 text-center" />
              WhatsApp Logs
            </Link>
            <Link href="/admin/customers" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200 text-sm font-medium text-gray-700">
              <i className="fa-solid fa-users w-4 text-center" />
              Manage Customers
            </Link>
            <Link href="/admin/services" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200 text-sm font-medium text-gray-700">
              <i className="fa-solid fa-edit w-4 text-center" />
              Edit Service Prices
            </Link>
            <Link href="/admin/content" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200 text-sm font-medium text-gray-700">
              <i className="fa-solid fa-pen-to-square w-4 text-center" />
              Edit Website Content
            </Link>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-6">Revenue Trend (Last 6 Months)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" style={{ fontSize: '10px' }} />
                <YAxis style={{ fontSize: '10px' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, "Revenue"]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-primary-500 font-semibold hover:text-primary-600">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td><div className="h-4 w-24 skeleton rounded" /></td>
                      <td><div className="h-4 w-20 skeleton rounded" /></td>
                      <td><div className="h-4 w-12 skeleton rounded" /></td>
                      <td><div className="h-4 w-16 skeleton rounded" /></td>
                    </tr>
                  ))
                ) : stats.recentOrders.length > 0 ? (
                  stats.recentOrders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td className="font-medium">{order.customerName}</td>
                      <td>{order.serviceName}</td>
                      <td className="font-semibold">₹{order.totalAmount}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-8">
                      No orders yet. They&apos;ll appear here once customers start booking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold mb-1">LuxWash Admin Panel</h3>
            <p className="text-primary-100 text-sm">Manage your laundry business from one place — orders, customers, pricing, and website content.</p>
          </div>
          <Link href="/" target="_blank" className="bg-white/20 hover:bg-white/30 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors duration-200 flex-shrink-0">
            View Website →
          </Link>
        </div>
      </div>
    </div>
  );
}
