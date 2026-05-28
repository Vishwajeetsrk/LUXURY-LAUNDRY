"use client";

import { useState, useEffect, useMemo } from "react";
import { usePanelUser } from "@/hooks/usePanelUser";
import { assignableRoles, ROLE_LABELS } from "@/lib/permissions";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  _count?: { orders: number };
}

export default function AdminCustomersPage() {
  const { user: panelUser, can } = usePanelUser();
  const canWrite = can("customers:write");
  const roleOptions = useMemo(
    () => assignableRoles(panelUser?.role || ""),
    [panelUser?.role]
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setCustomers(Array.isArray(json) ? json : json.data || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (c: Customer) => {
    if (!canWrite) return;
    setEditingId(c.id);
    setEditForm({ name: c.name, email: c.email, phone: c.phone, role: c.role });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/customers/${editingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomers((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...updated } : c))
        );
        setEditingId(null);
      } else {
        alert("Failed to update customer");
      }
    } catch {
      alert("Error updating customer");
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/customers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Failed to delete customer — they may have existing orders.");
      }
    } catch {
      alert("Error deleting customer");
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {customers.length} registered customers
          </p>
        </div>
        <input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input py-2 text-sm w-64"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Orders</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j}>
                        <div className="h-4 w-20 skeleton rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.id}>
                    {editingId === c.id ? (
                      <td colSpan={7}>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="form-label text-xs">Name</label>
                            <input
                              type="text"
                              value={editForm.name || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              className="form-input text-sm"
                            />
                          </div>
                          <div>
                            <label className="form-label text-xs">Email</label>
                            <input
                              type="email"
                              value={editForm.email || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  email: e.target.value,
                                })
                              }
                              className="form-input text-sm"
                            />
                          </div>
                          <div>
                            <label className="form-label text-xs">Phone</label>
                            <input
                              type="text"
                              value={editForm.phone || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  phone: e.target.value,
                                })
                              }
                              className="form-input text-sm"
                            />
                          </div>
                          <div>
                            <label className="form-label text-xs">Role</label>
                            <select
                              value={editForm.role || "CUSTOMER"}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  role: e.target.value,
                                })
                              }
                              className="form-input text-sm"
                            >
                              {roleOptions.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_LABELS[r] || r}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveEdit}
                              className="px-3 py-1.5 text-sm bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-primary-600 font-bold text-xs">
                                {c.name.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium">{c.name}</span>
                          </div>
                        </td>
                        <td>{c.email}</td>
                        <td>{c.phone || "—"}</td>
                        <td>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              c.role === "ADMIN" || c.role === "SUPER_ADMIN"
                                ? "bg-purple-100 text-purple-800"
                                : c.role === "STAFF"
                                  ? "bg-blue-100 text-blue-800"
                                  : c.role === "DELIVERY"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {c.role}
                          </span>
                        </td>
                        <td>{c._count?.orders ?? 0}</td>
                        <td className="text-xs text-gray-500">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="text-right">
                          {canWrite && (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => startEdit(c)}
                                className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                                title="Edit"
                              >
                                <i className="fa-solid fa-pen text-sm" />
                              </button>
                              {can("customers:delete") && (
                                <button
                                  onClick={() => deleteCustomer(c.id)}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                  title="Delete"
                                >
                                  <i className="fa-solid fa-trash text-sm" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-12">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
