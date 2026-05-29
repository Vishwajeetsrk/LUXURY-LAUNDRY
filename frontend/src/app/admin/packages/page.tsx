"use client";

import { useCallback, useEffect, useState } from "react";
import { usePanelUser } from "@/hooks/usePanelUser";

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  walletCredits: number;
  discountPercentage: number;
  features: string[];
  isActive: boolean;
}

export default function AdminPackagesPage() {
  const { can } = usePanelUser();
  const canWrite = can("packages:write") || can("services:write");
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Package>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", description: "", price: 0, walletCredits: 0, discountPercentage: 0, features: "[]" });

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/packages`);
      if (res.ok) {
        const data = await res.json();
        setPackages(data.data || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [API]);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const startEdit = (p: Package) => {
    setEditingId(p.id);
    setEditForm({ name: p.name, description: p.description, price: p.price, walletCredits: p.walletCredits, discountPercentage: p.discountPercentage, features: p.features, isActive: p.isActive });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/packages/${editingId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, features: Array.isArray(editForm.features) ? editForm.features : [] }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPackages((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        setEditingId(null);
      }
    } catch { /* ignore */ }
  };

  const addPackage = async () => {
    try {
      const token = localStorage.getItem("token");
      let parsedFeatures = [];
      try { parsedFeatures = JSON.parse(addForm.features); } catch { /* ignore */ }
      const res = await fetch(`${API}/api/packages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...addForm, features: parsedFeatures }),
      });
      if (res.ok) {
        const created = await res.json();
        setPackages((prev) => [...prev, created]);
        setShowAdd(false);
        setAddForm({ name: "", description: "", price: 0, walletCredits: 0, discountPercentage: 0, features: "[]" });
      }
    } catch { /* ignore */ }
  };

  const deletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/api/packages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Packages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage subscription packages & wallet credits</p>
        </div>
        {canWrite && (
          <button onClick={() => setShowAdd(!showAdd)} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2">
            <i className="fa-solid fa-plus text-xs" /> Add Package
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Add New Package</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Package Name</label>
              <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="form-input" placeholder="e.g. Bronze Package" />
            </div>
            <div>
              <label className="form-label">Price (₹)</label>
              <input type="number" value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: Number(e.target.value) })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Wallet Credits to Add</label>
              <input type="number" value={addForm.walletCredits} onChange={(e) => setAddForm({ ...addForm, walletCredits: Number(e.target.value) })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Auto Discount (%)</label>
              <input type="number" value={addForm.discountPercentage} onChange={(e) => setAddForm({ ...addForm, discountPercentage: Number(e.target.value) })} className="form-input" max="20" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Description</label>
              <textarea value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} className="form-input" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Features (JSON Array of strings)</label>
              <textarea value={addForm.features} onChange={(e) => setAddForm({ ...addForm, features: e.target.value })} className="form-input font-mono text-xs" rows={2} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={addPackage} className="px-4 py-2 text-sm bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600">Save Package</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="h-5 w-40 skeleton rounded mb-2" />
              <div className="h-4 w-64 skeleton rounded" />
            </div>
          ))
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {editingId === pkg.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input type="text" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="form-input" />
                    <input type="number" value={editForm.price || 0} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} className="form-input" title="Price" />
                    <input type="number" value={editForm.walletCredits || 0} onChange={(e) => setEditForm({ ...editForm, walletCredits: Number(e.target.value) })} className="form-input" title="Wallet Credits" />
                    <input type="number" value={editForm.discountPercentage || 0} onChange={(e) => setEditForm({ ...editForm, discountPercentage: Number(e.target.value) })} className="form-input" title="Discount" />
                  </div>
                  <textarea value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="form-input" rows={2} />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editForm.isActive !== false} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} className="w-4 h-4 rounded text-primary-500" />
                      <span className="text-sm">Active</span>
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
                      <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                      {!pkg.isActive && <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">Inactive</span>}
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{pkg.description}</p>
                    <div className="flex items-baseline gap-4 mt-2">
                      <span className="text-xl font-black text-primary-600">₹{pkg.price}</span>
                      <span className="text-sm font-semibold text-green-600">+{pkg.walletCredits} Wallet</span>
                      <span className="text-sm font-semibold text-blue-600">{pkg.discountPercentage}% OFF</span>
                    </div>
                  </div>
                  {canWrite && (
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => startEdit(pkg)} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg">
                        <i className="fa-solid fa-pen text-sm" />
                      </button>
                      <button onClick={() => deletePackage(pkg.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
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
