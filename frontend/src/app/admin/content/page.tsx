"use client";

import { useState, useEffect } from "react";

interface ContentItem {
  key: string;
  value: string;
  type: string;
}

const defaultContent: ContentItem[] = [
  { key: "hero_title", value: "Premium Laundry Experience", type: "text" },
  { key: "hero_subtitle", value: "Experience premium laundry and dry cleaning services with free doorstep pickup and delivery.", type: "text" },
  { key: "hero_cta", value: "Explore Services", type: "text" },
  { key: "cards_title", value: "Your Journey Begins Here", type: "text" },
  { key: "cards_subtitle", value: "We make every moment count with solutions designed just for you.", type: "text" },
  { key: "banner_title", value: "Fresh Clothes. Premium Care. Doorstep Delivery.", type: "text" },
  { key: "banner_subtitle", value: "Experience a smarter laundry service with expert fabric care, free pickup, and fast delivery.", type: "text" },
  { key: "trust_title", value: "Trusted By Thousands Of Happy Customers", type: "text" },
  { key: "stats_title", value: "Our Laundry Success Journey", type: "text" },
  { key: "footer_about", value: "LuxWash Premium Laundry provides expert fabric care with modern cleaning technology, doorstep pickup, and fast delivery service.", type: "text" },
];

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentItem[]>(defaultContent);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/content`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setContent(data);
      }
    } catch { /* use defaults */ }
  };

  const startEdit = (item: ContentItem) => {
    setEditingKey(item.key);
    setEditValue(item.value);
  };

  const saveContent = async () => {
    if (!editingKey) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/content/${editingKey}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ value: editValue }),
      });
      if (res.ok) {
        setContent((prev) =>
          prev.map((c) => (c.key === editingKey ? { ...c, value: editValue } : c))
        );
        setSavedKey(editingKey);
        setEditingKey(null);
        setTimeout(() => setSavedKey(null), 2000);
      }
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  const formatKey = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Content Editor</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit your website text content. Changes will reflect on the public website.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <i className="fa-solid fa-circle-info" />
          <span>Click the <strong>Edit</strong> button to modify any content block. Changes are saved to the database and reflect on the website.</span>
        </div>
      </div>

      <div className="space-y-3">
        {content.map((item) => (
          <div
            key={item.key}
            className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${
              savedKey === item.key ? "border-green-400 bg-green-50" : "border-gray-100"
            }`}
          >
            {editingKey === item.key ? (
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-gray-700">{formatKey(item.key)}</label>
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">{item.key}</span>
                </div>
                {item.value.length > 100 ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="form-input mb-3"
                    rows={4}
                  />
                ) : (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="form-input mb-3"
                  />
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingKey(null)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveContent}
                    disabled={saving}
                    className="px-4 py-2 text-sm bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-700">{formatKey(item.key)}</span>
                    {savedKey === item.key && (
                      <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <i className="fa-solid fa-check" /> Saved!
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{item.value}</p>
                </div>
                <button
                  onClick={() => startEdit(item)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                  title="Edit"
                >
                  <i className="fa-solid fa-pen text-sm" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
