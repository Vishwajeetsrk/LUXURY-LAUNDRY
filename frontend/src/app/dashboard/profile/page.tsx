"use client";

import { useEffect, useState } from "react";
import { addressesToFormStrings, formatAddress, parseFormAddresses, type AddressEntry } from "@/lib/address";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", addresses: [] as string[] });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          const userAddresses = addressesToFormStrings(
            Array.isArray(data.addresses) ? data.addresses : data.addresses ? [data.addresses] : []
          );
          setFormData({ name: data.name || "", phone: data.phone || "", addresses: userAddresses });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ ...formData, addresses: parseFormAddresses(formData.addresses) })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsEditing(false);
        // Also update local storage user cache if needed
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, name: data.name, phone: data.phone }));
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!user) return <div>Error loading profile.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)} 
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors"
            >
              <i className="fa-solid fa-pen mr-2"></i>Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const userAddresses = addressesToFormStrings(
                    Array.isArray(user.addresses) ? user.addresses : user.addresses ? [user.addresses] : []
                  );
                  setFormData({ name: user.name || "", phone: user.phone || "", addresses: userAddresses });
                  setIsEditing(false);
                }} 
                className="text-sm font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                disabled={saving}
              >
                {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                Save
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">Customer Account</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              ) : (
                <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100">
                  {user.name}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <div className="text-gray-500 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-not-allowed">
                {user.email} <span className="text-xs text-gray-400 ml-2">(Cannot be changed)</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Mobile No</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter your mobile number"
                  className="w-full text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              ) : (
                <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100">
                  {user.phone || "Not provided"}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-2">Addresses</label>
              {isEditing ? (
                <div className="space-y-3">
                  {formData.addresses.map((address, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <textarea 
                        value={address}
                        onChange={(e) => {
                          const newAddrs = [...formData.addresses];
                          newAddrs[idx] = e.target.value;
                          setFormData({...formData, addresses: newAddrs});
                        }}
                        placeholder="Enter your delivery address"
                        rows={2}
                        className="flex-1 text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newAddrs = formData.addresses.filter((_, i) => i !== idx);
                          setFormData({...formData, addresses: newAddrs});
                        }}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, addresses: [...formData.addresses, ""]})}
                    className="text-sm font-medium text-primary-600 flex items-center gap-2 hover:text-primary-800"
                  >
                    <i className="fa-solid fa-plus"></i> Add New Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {user.addresses && user.addresses.length > 0 ? (
                    user.addresses.map((addr: unknown, idx: number) => (
                      <div key={idx} className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100 min-h-[50px]">
                        {formatAddress(addr as AddressEntry)}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100 min-h-[50px]">
                      Not provided
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
