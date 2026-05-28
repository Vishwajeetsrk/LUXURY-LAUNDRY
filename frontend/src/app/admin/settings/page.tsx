"use client";

import { useState, useEffect } from "react";

interface Setting {
  key: string;
  value: string;
}

const settingFields = [
  { key: "site_name", label: "Business Name", icon: "fa-solid fa-store", placeholder: "LUXURY LAUNDRY" },
  { key: "phone", label: "Phone Number", icon: "fa-solid fa-phone", placeholder: "+91-9663574728" },
  { key: "email", label: "Email Address", icon: "fa-solid fa-envelope", placeholder: "support@luxwash.com" },
  { key: "address", label: "Address", icon: "fa-solid fa-location-dot", placeholder: "Shop No. 504, Bagrota, Ajmer Road, Jaipur" },
  { key: "hours", label: "Business Hours", icon: "fa-solid fa-clock", placeholder: "Open All Week: 10:00 AM – 8:00 PM" },
  { key: "whatsapp", label: "WhatsApp Number", icon: "fa-brands fa-whatsapp", placeholder: "+919663574728" },
  { key: "min_free_delivery", label: "Min Order for Free Delivery (₹)", icon: "fa-solid fa-truck", placeholder: "499" },
  { key: "pickup_charge", label: "Pickup Charge (₹)", icon: "fa-solid fa-indian-rupee-sign", placeholder: "100" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/content/settings`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data: Setting[] = await res.json();
        const map: Record<string, string> = {};
        data.forEach((s) => { map[s.key] = s.value; });
        setSettings(map);
      }
    } catch { /* ignore */ }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      for (const [key, value] of Object.entries(settings)) {
        await fetch(`${API}/api/content/${key}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ value, type: "setting" }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Site Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your business information and contact details</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-60 flex items-center gap-2"
        >
          {saving ? (
            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Saving...</>
          ) : saved ? (
            <><i className="fa-solid fa-check" /> Saved!</>
          ) : (
            <><i className="fa-solid fa-floppy-disk" /> Save Changes</>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {settingFields.map((field) => (
            <div key={field.key}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <i className={`${field.icon} text-gray-400 w-4 text-center`} />
                {field.label}
              </label>
              <input
                type="text"
                value={settings[field.key] || ""}
                onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="form-input"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="font-bold text-red-800 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-4">These actions are irreversible. Proceed with caution.</p>
        <button className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200">
          Reset All Settings to Default
        </button>
      </div>
    </div>
  );
}
