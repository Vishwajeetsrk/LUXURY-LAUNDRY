"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  badge: string | null;
  badgeColor: string | null;
  category: string;
  unit: string;
  isActive: boolean;
  sortOrder: number;
}

const badgeOptions = [
  { value: "", label: "None" },
  { value: "Best Seller", label: "Best Seller" },
  { value: "Premium", label: "Premium" },
  { value: "New", label: "New" },
  { value: "Luxury", label: "Luxury" },
  { value: "Popular", label: "Popular" },
];

const badgeColorOptions = [
  { value: "bg-green-500", label: "Green" },
  { value: "bg-primary-500", label: "Blue" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-purple-600", label: "Purple" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-yellow-500", label: "Yellow" },
];

const categoryOptions = [
  { value: "general", label: "General" },
  { value: "wash", label: "Wash" },
  { value: "dry-clean", label: "Dry Clean" },
  { value: "iron", label: "Iron" },
  { value: "shoe", label: "Shoe Care" },
  { value: "home", label: "Home Care" },
];

export default function AdminShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ShopProduct>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    image: "",
    badge: "",
    badgeColor: "bg-green-500",
    category: "general",
    unit: "pack",
    sortOrder: 0,
  });

  const API = API_URL;

  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/shop-products?all=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const startEdit = (p: ShopProduct) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image,
      badge: p.badge,
      badgeColor: p.badgeColor,
      category: p.category,
      unit: p.unit,
      isActive: p.isActive,
      sortOrder: p.sortOrder,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/shop-products/${editingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p))
        );
        setEditingId(null);
      }
    } catch {
      /* ignore */
    }
  };

  const addProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...addForm,
        originalPrice: addForm.originalPrice || null,
        image: addForm.image || null,
        badge: addForm.badge || null,
      };
      const res = await fetch(`${API}/api/shop-products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setProducts((prev) => [...prev, created]);
        setShowAdd(false);
        setAddForm({
          name: "",
          description: "",
          price: 0,
          originalPrice: 0,
          image: "",
          badge: "",
          badgeColor: "bg-green-500",
          category: "general",
          unit: "pack",
          sortOrder: 0,
        });
      }
    } catch {
      /* ignore */
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shop product?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/api/shop-products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      /* ignore */
    }
  };

  const toggleActive = async (p: ShopProduct) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/shop-products/${p.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) =>
          prev.map((x) => (x.id === p.id ? updated : x))
        );
      }
    } catch {
      /* ignore */
    }
  };

  const discount = (price: number, originalPrice: number | null) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Shop Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage products shown on the public Shop page
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <i className="fa-solid fa-plus text-xs" /> Add Product
        </button>
      </div>

      {/* Add Product Form */}
      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Add New Product</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Product Name</label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm({ ...addForm, name: e.target.value })
                }
                className="form-input"
                placeholder="e.g. Wash & Fold — 5kg Pack"
              />
            </div>
            <div>
              <label className="form-label">Price (₹)</label>
              <input
                type="number"
                value={addForm.price}
                onChange={(e) =>
                  setAddForm({ ...addForm, price: Number(e.target.value) })
                }
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Original Price (₹)</label>
              <input
                type="number"
                value={addForm.originalPrice}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    originalPrice: Number(e.target.value),
                  })
                }
                className="form-input"
                placeholder="For showing discount"
              />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select
                value={addForm.category}
                onChange={(e) =>
                  setAddForm({ ...addForm, category: e.target.value })
                }
                className="form-input"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Unit</label>
              <select
                value={addForm.unit}
                onChange={(e) =>
                  setAddForm({ ...addForm, unit: e.target.value })
                }
                className="form-input"
              >
                <option value="pack">Pack</option>
                <option value="kg">per kg</option>
                <option value="piece">per piece</option>
                <option value="pair">per pair</option>
                <option value="sqft">per sq.ft</option>
              </select>
            </div>
            <div>
              <label className="form-label">Sort Order</label>
              <input
                type="number"
                value={addForm.sortOrder}
                onChange={(e) =>
                  setAddForm({ ...addForm, sortOrder: Number(e.target.value) })
                }
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Badge</label>
              <select
                value={addForm.badge}
                onChange={(e) =>
                  setAddForm({ ...addForm, badge: e.target.value })
                }
                className="form-input"
              >
                {badgeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Badge Color</label>
              <select
                value={addForm.badgeColor}
                onChange={(e) =>
                  setAddForm({ ...addForm, badgeColor: e.target.value })
                }
                className="form-input"
              >
                {badgeColorOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Image URL</label>
              <input
                type="text"
                value={addForm.image}
                onChange={(e) =>
                  setAddForm({ ...addForm, image: e.target.value })
                }
                className="form-input"
                placeholder="/images/wash_fold.png"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="form-label">Description</label>
              <textarea
                value={addForm.description}
                onChange={(e) =>
                  setAddForm({ ...addForm, description: e.target.value })
                }
                className="form-input"
                rows={2}
                placeholder="Describe the product..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={addProduct}
              className="px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Save Product
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Badge
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Category
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-4">
                        <div className="h-5 w-48 skeleton rounded" />
                      </td>
                    </tr>
                  ))
                : products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50/50 transition-colors duration-150"
                    >
                      {editingId === product.id ? (
                        <td colSpan={6} className="px-4 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                              <label className="form-label text-xs">
                                Price
                              </label>
                              <input
                                type="number"
                                value={editForm.price || 0}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    price: Number(e.target.value),
                                  })
                                }
                                className="form-input text-sm"
                              />
                            </div>
                            <div>
                              <label className="form-label text-xs">
                                Original Price
                              </label>
                              <input
                                type="number"
                                value={editForm.originalPrice || 0}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    originalPrice: Number(e.target.value),
                                  })
                                }
                                className="form-input text-sm"
                              />
                            </div>
                            <div>
                              <label className="form-label text-xs">
                                Category
                              </label>
                              <select
                                value={editForm.category || "general"}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    category: e.target.value,
                                  })
                                }
                                className="form-input text-sm"
                              >
                                {categoryOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="form-label text-xs">
                                Badge
                              </label>
                              <select
                                value={editForm.badge || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    badge: e.target.value,
                                  })
                                }
                                className="form-input text-sm"
                              >
                                {badgeOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="form-label text-xs">
                                Badge Color
                              </label>
                              <select
                                value={editForm.badgeColor || "bg-green-500"}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    badgeColor: e.target.value,
                                  })
                                }
                                className="form-input text-sm"
                              >
                                {badgeColorOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="form-label text-xs">Unit</label>
                              <select
                                value={editForm.unit || "pack"}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    unit: e.target.value,
                                  })
                                }
                                className="form-input text-sm"
                              >
                                <option value="pack">Pack</option>
                                <option value="kg">per kg</option>
                                <option value="piece">per piece</option>
                                <option value="pair">per pair</option>
                                <option value="sqft">per sq.ft</option>
                              </select>
                            </div>
                            <div>
                              <label className="form-label text-xs">
                                Sort Order
                              </label>
                              <input
                                type="number"
                                value={editForm.sortOrder || 0}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    sortOrder: Number(e.target.value),
                                  })
                                }
                                className="form-input text-sm"
                              />
                            </div>
                            <div>
                              <label className="form-label text-xs">
                                Image URL
                              </label>
                              <input
                                type="text"
                                value={editForm.image || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    image: e.target.value,
                                  })
                                }
                                className="form-input text-sm"
                                placeholder="/images/..."
                              />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                              <label className="form-label text-xs">
                                Description
                              </label>
                              <textarea
                                value={editForm.description || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    description: e.target.value,
                                  })
                                }
                                className="form-input text-sm"
                                rows={2}
                              />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editForm.isActive !== false}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      isActive: e.target.checked,
                                    })
                                  }
                                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">
                                  Active
                                </span>
                              </label>
                              <div className="flex-1" />
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
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {product.image && (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-bold text-gray-900">
                                ₹{product.price}
                              </span>
                              {product.originalPrice &&
                                product.originalPrice > product.price && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{product.originalPrice}
                                  </span>
                                )}
                            </div>
                            {discount(product.price, product.originalPrice) && (
                              <span className="text-xs text-green-600 font-medium">
                                {discount(product.price, product.originalPrice)}%
                                off
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {product.badge ? (
                              <span
                                className={`inline-flex px-2 py-0.5 text-xs font-semibold text-white rounded-full ${product.badgeColor || "bg-gray-500"}`}
                              >
                                {product.badge}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-sm text-gray-600 capitalize">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleActive(product)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${
                                product.isActive
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => startEdit(product)}
                                className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                                title="Edit"
                              >
                                <i className="fa-solid fa-pen text-sm" />
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Delete"
                              >
                                <i className="fa-solid fa-trash text-sm" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <i className="fa-solid fa-box-open text-4xl text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-900">
              No shop products yet
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Click &quot;Add Product&quot; to create your first shop item.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
