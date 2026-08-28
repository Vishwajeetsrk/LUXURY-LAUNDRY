"use client";

import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/lib/api";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PICKUP_REQUESTED: "bg-blue-100 text-blue-800",
  COLLECTED: "bg-indigo-100 text-indigo-800",
  IN_CLEANING: "bg-purple-100 text-purple-800",
  READY: "bg-teal-100 text-teal-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
  PAYMENT_PENDING: "bg-red-100 text-red-800",
  PAYMENT_COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-gray-200 text-gray-800",
};

const allStatuses = [
  "PENDING",
  "PICKUP_REQUESTED",
  "COLLECTED",
  "IN_CLEANING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "PAYMENT_PENDING",
  "PAYMENT_COMPLETED",
  "CANCELLED"
];

interface Order {
  id: string;
  customerId?: string;
  customer?: { id: string; name: string; email: string };
  serviceId?: string;
  service?: { id: string; name: string };
  status: string;
  quantity: number;
  totalAmount: number;
  address: string;
  notes?: string;
  pickupDate?: string;
  deliveryDate?: string;
  createdAt: string;
}

interface Service { id: string; name: string; pricePerUnit: number; unit: string }
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import { Skeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";

interface Customer { id: string; name: string; email: string }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  
  // Modals state
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ customerId: "", serviceId: "", quantity: 1, address: "", notes: "" });
  
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Order>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const API = API_URL;

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setOrders(Array.isArray(json) ? json : json.data || []);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [API]);

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/services`);
      if (res.ok) {
        const json = await res.json();
        setServices(Array.isArray(json) ? json : json.data || []);
      }
    } catch { /* ignore */ }
  }, [API]);

  const fetchCustomers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setCustomers(Array.isArray(json) ? json : json.data || []);
      }
    } catch { /* ignore */ }
  }, [API]);

  useEffect(() => {
    fetchOrders();
    fetchServices();
    fetchCustomers();
    
    // Set up Socket.IO connection for real-time updates
    const token = localStorage.getItem("token");
    
    let socket: Socket;
    if (token) {
      socket = io(API_URL, {
        auth: { token }
      });

      socket.on("dashboardUpdate", (data) => {
        if (data.type === 'NEW_ORDER' || data.type === 'ORDER_STATUS_CHANGED') {
          fetchOrders();
        }
      });
    }

    const pollInterval = setInterval(() => {
      fetchOrders();
    }, 30000); // 30s polling fallback

    return () => {
      if (socket) socket.disconnect();
      clearInterval(pollInterval);
    };
  }, [fetchOrders, fetchServices, fetchCustomers]);

  const addOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        fetchOrders();
        setShowAdd(false);
        setAddForm({ customerId: "", serviceId: "", quantity: 1, address: "", notes: "" });
      } else {
        alert("Failed to create order");
      }
    } catch { alert("Failed to create order"); }
  };

  const openEdit = (order: Order) => {
    setEditingId(order.id);
    setEditForm({
      status: order.status,
      serviceId: order.service?.id || order.serviceId,
      quantity: order.quantity,
      address: order.address,
      notes: order.notes || "",
      totalAmount: order.totalAmount
    });
    setShowEdit(true);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/orders/${editingId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        fetchOrders();
        setShowEdit(false);
        setEditingId(null);
      } else {
        alert("Failed to update order");
      }
    } catch { alert("Failed to update order"); }
  };

  const updateStatusInline = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/orders/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
      }
    } catch { /* ignore */ }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this order?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      }
    } catch { /* ignore */ }
  };

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const [sorting, setSorting] = useState<SortingState>([]);
  const columnHelper = createColumnHelper<Order>();

  const columns = [
    columnHelper.accessor('id', {
      header: 'Order ID',
      cell: info => <span className="font-mono text-xs">{info.getValue().slice(0, 8)}...</span>,
    }),
    columnHelper.accessor('customer', {
      header: 'Customer',
      cell: info => (
        <div>
          <div className="font-medium">{info.getValue()?.name || "—"}</div>
          <div className="text-xs text-gray-400">{info.getValue()?.email}</div>
        </div>
      ),
    }),
    columnHelper.accessor('service.name', {
      header: 'Service',
      cell: info => info.getValue() || "—",
    }),
    columnHelper.accessor('quantity', {
      header: 'Qty',
    }),
    columnHelper.accessor('totalAmount', {
      header: 'Amount',
      cell: info => <span className="font-semibold">₹{info.getValue()}</span>,
    }),
    columnHelper.accessor('address', {
      header: 'Address',
      cell: info => <span className="max-w-[150px] truncate text-xs block">{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <select
          value={info.getValue()}
          onChange={(e) => updateStatusInline(info.row.original.id, e.target.value)}
          className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer border-none shadow-sm ${statusColors[info.getValue()] || "bg-gray-100 text-gray-800"}`}
        >
          {allStatuses.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Date',
      cell: info => <span className="text-xs text-gray-500">{new Date(info.getValue()).toLocaleDateString()}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(info.row.original)} className="text-primary-500 hover:text-primary-600 text-xs font-semibold p-1">Edit</button>
          <button onClick={() => deleteOrder(info.row.original.id)} className="text-red-500 hover:text-red-600 text-xs font-semibold p-1">Delete</button>
        </div>
      ),
    })
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} total orders</p>
        </div>
        <div className="flex gap-4">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="form-input py-2 text-sm w-48">
            <option value="ALL">All Statuses</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          <button onClick={() => setShowAdd(true)} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200">
            <i className="fa-solid fa-plus mr-2" /> Add Order
          </button>
        </div>
      </div>

      {/* Add Order Form */}
      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Add New Order</h3>
          <form onSubmit={addOrder} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Customer</label>
              <select required value={addForm.customerId} onChange={(e) => setAddForm({ ...addForm, customerId: e.target.value })} className="form-input">
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Service</label>
              <select required value={addForm.serviceId} onChange={(e) => setAddForm({ ...addForm, serviceId: e.target.value })} className="form-input">
                <option value="">Select Service</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} - ₹{s.pricePerUnit}/{s.unit}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Quantity</label>
              <input type="number" required min="1" value={addForm.quantity} onChange={(e) => setAddForm({ ...addForm, quantity: Number(e.target.value) })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Address</label>
              <input type="text" required value={addForm.address} onChange={(e) => setAddForm({ ...addForm, address: e.target.value })} className="form-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Notes (Optional)</label>
              <textarea value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} className="form-input" rows={2} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg">Save Order</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Order Form */}
      {showEdit && editingId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 border-t-4 border-t-primary-500">
          <h3 className="font-bold text-gray-900 mb-4">Edit Order #{editingId.slice(0, 8)}</h3>
          <form onSubmit={saveEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Status</label>
              <select required value={editForm.status || ""} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="form-input">
                {allStatuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Service</label>
              <select required value={editForm.serviceId || ""} onChange={(e) => setEditForm({ ...editForm, serviceId: e.target.value })} className="form-input">
                <option value="">Select Service</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} - ₹{s.pricePerUnit}/{s.unit}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Quantity</label>
              <input type="number" required min="1" step="0.1" value={editForm.quantity || 1} onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Total Amount (₹)</label>
              <input type="number" required min="0" value={editForm.totalAmount || 0} onChange={(e) => setEditForm({ ...editForm, totalAmount: Number(e.target.value) })} className="form-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Address</label>
              <input type="text" required value={editForm.address || ""} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="form-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Notes</label>
              <textarea value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="form-input" rows={2} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => { setShowEdit(false); setEditingId(null); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg">Update Order</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} onClick={header.column.getToggleSortingHandler()} className="cursor-pointer select-none">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="p-4"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8">
                    <EmptyState 
                      icon="fa-receipt" 
                      title="No orders found" 
                      description={filter !== "ALL" ? `We couldn't find any ${filter.replace(/_/g, " ").toLowerCase()} orders.` : "No orders have been placed yet."} 
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination controls */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <div className="flex gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
