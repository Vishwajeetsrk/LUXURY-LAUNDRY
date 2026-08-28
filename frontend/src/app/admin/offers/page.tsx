"use client";

import { useCallback, useEffect, useState } from "react";
import { usePanelUser } from "@/hooks/usePanelUser";
import { API_URL } from "@/lib/api";

interface Offer {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
}

export default function AdminOffersPage() {
  const { can } = usePanelUser();
  const canWrite = can("packages:write") || can("services:write");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Offer>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ 
    code: "", description: "", discountType: "PERCENTAGE", 
    discountValue: 0, minOrderValue: 0, maxDiscount: "", usageLimit: "" 
  });

  const API = API_URL;

  const fetchOffers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/offers/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOffers(data.data || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [API]);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const startEdit = (o: Offer) => {
    setEditingId(o.id);
    setEditForm({ 
      code: o.code, description: o.description, discountType: o.discountType, 
      discountValue: o.discountValue, minOrderValue: o.minOrderValue, 
      maxDiscount: o.maxDiscount, usageLimit: o.usageLimit, isActive: o.isActive 
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/offers/${editingId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setOffers((prev) => prev.map((o) => (o.id === editingId ? updated : o)));
        setEditingId(null);
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to update offer");
      }
    } catch { /* ignore */ }
  };

  const addOffer = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/offers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addForm,
          maxDiscount: addForm.maxDiscount ? Number(addForm.maxDiscount) : null,
          usageLimit: addForm.usageLimit ? Number(addForm.usageLimit) : null,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setOffers((prev) => [created, ...prev]);
        setShowAdd(false);
        setAddForm({ code: "", description: "", discountType: "PERCENTAGE", discountValue: 0, minOrderValue: 0, maxDiscount: "", usageLimit: "" });
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to add offer");
      }
    } catch { /* ignore */ }
  };

  const deleteOffer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/api/offers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Offers & Promotions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage discount codes and promotional offers</p>
        </div>
        {canWrite && (
          <button onClick={() => setShowAdd(!showAdd)} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2">
            <i className="fa-solid fa-plus text-xs" /> Add Offer
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Add New Offer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Offer Code</label>
              <input type="text" value={addForm.code} onChange={(e) => setAddForm({ ...addForm, code: e.target.value.toUpperCase() })} className="form-input uppercase" placeholder="e.g. SUMMER20" />
            </div>
            <div>
              <label className="form-label">Discount Type</label>
              <select value={addForm.discountType} onChange={(e) => setAddForm({ ...addForm, discountType: e.target.value })} className="form-input">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Discount Value</label>
              <input type="number" value={addForm.discountValue} onChange={(e) => setAddForm({ ...addForm, discountValue: Number(e.target.value) })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Min Order Value (₹)</label>
              <input type="number" value={addForm.minOrderValue} onChange={(e) => setAddForm({ ...addForm, minOrderValue: Number(e.target.value) })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Max Discount (₹, Optional)</label>
              <input type="number" value={addForm.maxDiscount} onChange={(e) => setAddForm({ ...addForm, maxDiscount: e.target.value })} className="form-input" placeholder="Leave empty for none" />
            </div>
            <div>
              <label className="form-label">Total Usage Limit (Optional)</label>
              <input type="number" value={addForm.usageLimit} onChange={(e) => setAddForm({ ...addForm, usageLimit: e.target.value })} className="form-input" placeholder="e.g. 100 uses" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="form-label">Description</label>
              <textarea value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} className="form-input" rows={2} placeholder="Optional details..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={addOffer} className="px-4 py-2 text-sm bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600">Save Offer</button>
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
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            No offers available yet. Create one above!
          </div>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {editingId === offer.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input type="text" value={editForm.code || ""} onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })} className="form-input uppercase" title="Code" />
                    <select value={editForm.discountType || "PERCENTAGE"} onChange={(e) => setEditForm({ ...editForm, discountType: e.target.value })} className="form-input">
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Flat Amount (₹)</option>
                    </select>
                    <input type="number" value={editForm.discountValue || 0} onChange={(e) => setEditForm({ ...editForm, discountValue: Number(e.target.value) })} className="form-input" title="Value" />
                    <input type="number" value={editForm.minOrderValue || 0} onChange={(e) => setEditForm({ ...editForm, minOrderValue: Number(e.target.value) })} className="form-input" title="Min Order" />
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-lg uppercase tracking-wider">{offer.code}</h3>
                      {!offer.isActive && <span className="px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-600 rounded-full">Inactive</span>}
                    </div>
                    {offer.description && <p className="text-sm text-gray-500 mb-2">{offer.description}</p>}
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-2">
                      <span className="text-sm font-black text-primary-600">
                        {offer.discountType === "PERCENTAGE" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                      </span>
                      {offer.minOrderValue > 0 && <span className="text-xs font-medium text-gray-500">Min Order: ₹{offer.minOrderValue}</span>}
                      {offer.maxDiscount && <span className="text-xs font-medium text-gray-500">Max Discount: ₹{offer.maxDiscount}</span>}
                      {offer.usageLimit && <span className="text-xs font-medium text-gray-500">Used: {offer.usageCount} / {offer.usageLimit}</span>}
                    </div>
                  </div>
                  {canWrite && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(offer)} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg">
                        <i className="fa-solid fa-pen text-sm" />
                      </button>
                      <button onClick={() => deleteOffer(offer.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
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
