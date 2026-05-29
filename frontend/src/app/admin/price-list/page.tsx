"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface PriceListItem {
  id: string;
  category: string;
  name: string;
  dryCleanPrice: string | null;
  steamIronPrice: string | null;
  price: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminPriceList() {
  const [items, setItems] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<PriceListItem>>({
    category: "MEN'S WEAR",
    name: "",
    dryCleanPrice: "",
    steamIronPrice: "",
    price: "",
    image: "",
    isActive: true,
    sortOrder: 0,
  });
  const [uploading, setUploading] = useState(false);

  const categories = [
    "MEN'S WEAR",
    "WOMEN'S WEAR",
    "WOOLEN",
    "HOUSEHOLD ITEMS",
    "SHOES",
    "BAGS",
    "LAUNDRY"
  ];

  const fetchItems = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/price-list`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch price list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const token = localStorage.getItem("token");
    const file = e.target.files[0];
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, image: data.url });
      } else {
        alert("Image upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Image upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing 
      ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/price-list/${formData.id}`
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/price-list`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchItems();
      } else {
        alert("Failed to save item.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving item.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/price-list/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setFormData({
      category: "MEN'S WEAR",
      name: "",
      dryCleanPrice: "",
      steamIronPrice: "",
      price: "",
      image: "",
      isActive: true,
      sortOrder: 0,
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (item: PriceListItem) => {
    setFormData(item);
    setIsEditing(true);
    setShowModal(true);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Pricing Plan List</h1>
        <button
          onClick={openAddModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700"
        >
          + Add New Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-700">Image</th>
              <th className="p-4 text-sm font-semibold text-gray-700">Category & Name</th>
              <th className="p-4 text-sm font-semibold text-gray-700">Prices (Dry Clean / Steam / Gen)</th>
              <th className="p-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4">
                  {item.image ? (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <i className="fa-solid fa-image"></i>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </td>
                <td className="p-4">
                  {item.dryCleanPrice && <p className="text-sm">Dry Clean: <span className="font-medium">{item.dryCleanPrice}</span></p>}
                  {item.steamIronPrice && <p className="text-sm">Steam Iron: <span className="font-medium">{item.steamIronPrice}</span></p>}
                  {item.price && <p className="text-sm">General: <span className="font-medium">{item.price}</span></p>}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => openEditModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No pricing items found. Click "Add New Item" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{isEditing ? "Edit Item" : "Add New Item"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    required
                    className="w-full border rounded-lg p-2.5"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full border rounded-lg p-2.5"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dry Clean Price</label>
                  <input 
                    type="text"
                    placeholder="e.g. 200/200"
                    className="w-full border rounded-lg p-2.5"
                    value={formData.dryCleanPrice || ""}
                    onChange={(e) => setFormData({...formData, dryCleanPrice: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Steam Iron Price</label>
                  <input 
                    type="text"
                    placeholder="e.g. 20/20"
                    className="w-full border rounded-lg p-2.5"
                    value={formData.steamIronPrice || ""}
                    onChange={(e) => setFormData({...formData, steamIronPrice: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">General Price</label>
                  <input 
                    type="text"
                    placeholder="e.g. 85/Kg"
                    className="w-full border rounded-lg p-2.5"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL or Upload</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text"
                    placeholder="https://..."
                    className="flex-1 border rounded-lg p-2.5"
                    value={formData.image || ""}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                  />
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button type="button" className="bg-gray-100 border text-gray-700 px-4 py-2.5 rounded-lg whitespace-nowrap">
                      {uploading ? "Uploading..." : "Upload File"}
                    </button>
                  </div>
                </div>
                {formData.image && (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border mt-2">
                    <img src={formData.image} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <span className="text-sm font-medium">Active (Visible to public)</span>
                </label>
                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-sm font-medium">Sort Order</label>
                  <input 
                    type="number" 
                    className="border rounded px-2 py-1 w-20"
                    value={formData.sortOrder || 0}
                    onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {isEditing ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
