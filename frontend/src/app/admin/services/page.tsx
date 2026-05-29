"use client";

import { useCallback, useEffect, useState } from "react";
import { usePanelUser } from "@/hooks/usePanelUser";

interface Service {
  id: string;
  name: string;
  description: string;
  pricePerUnit: number;
  unit: string;
  isActive: boolean;
  imageUrl?: string;
}

export default function AdminServicesPage() {
  const { can } = usePanelUser();
  const canWrite = can("services:write");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Service>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", description: "", pricePerUnit: 0, unit: "kg" });

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/services`);
      if (res.ok) setServices(await res.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [API]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, description: s.description, pricePerUnit: s.pricePerUnit, unit: s.unit, isActive: s.isActive });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/services/${editingId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setServices((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
        setEditingId(null);
      }
    } catch { /* ignore */ }
  };

  const addService = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/services`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        const created = await res.json();
        setServices((prev) => [...prev, created]);
        setShowAdd(false);
        setAddForm({ name: "", description: "", pricePerUnit: 0, unit: "kg" });
      }
    } catch { /* ignore */ }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/api/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your laundry service offerings & pricing</p>
        </div>
        {canWrite && (
          <button onClick={() => setShowAdd(!showAdd)} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2">
            <i className="fa-solid fa-plus text-xs" /> Add Service
          </button>
        )}
      </div>

      {/* Add Service Form */}
      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Add New Service</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Service Name</label>
              <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="form-input" placeholder="e.g. Wash & Fold" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="form-label">Price</label>
                <input type="number" value={addForm.pricePerUnit} onChange={(e) => setAddForm({ ...addForm, pricePerUnit: Number(e.target.value) })} className="form-input" />
              </div>
              <div className="w-24">
                <label className="form-label">Unit</label>
                <select value={addForm.unit} onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })} className="form-input">
                  <option value="kg">per kg</option>
                  <option value="piece">per piece</option>
                  <option value="pair">per pair</option>
                  <option value="sqft">per sq.ft</option>
                </select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Description</label>
              <textarea value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} className="form-input" rows={2} placeholder="Describe the service..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">Cancel</button>
            <button onClick={addService} className="px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-200">Save Service</button>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="h-5 w-40 skeleton rounded mb-2" />
              <div className="h-4 w-64 skeleton rounded" />
            </div>
          ))
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {editingId === service.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="form-input" />
                    <input type="number" value={editForm.pricePerUnit || 0} onChange={(e) => setEditForm({ ...editForm, pricePerUnit: Number(e.target.value) })} className="form-input" />
                    <select value={editForm.unit || "kg"} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })} className="form-input">
                      <option value="kg">per kg</option>
                      <option value="piece">per piece</option>
                      <option value="pair">per pair</option>
                      <option value="sqft">per sq.ft</option>
                    </select>
                  </div>
                  <textarea value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="form-input" rows={2} />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editForm.isActive !== false} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <div className="flex-1" />
                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={saveEdit} className="px-3 py-1.5 text-sm bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600">Save</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900">{service.name}</h3>
                      {!service.isActive && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{service.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-primary-600">₹{service.pricePerUnit}</span>
                      <span className="text-sm text-gray-400">/ {service.unit}</span>
                    </div>
                  </div>
                  {canWrite && (
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => startEdit(service)} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors duration-200" title="Edit">
                        <i className="fa-solid fa-pen text-sm" />
                      </button>
                      <button onClick={() => deleteService(service.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200" title="Delete">
                        <i className="fa-solid fa-trash text-sm" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
