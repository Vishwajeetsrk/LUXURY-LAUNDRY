"use client";

import { useEffect, useState } from "react";
import { addressesToFormStrings, formatAddress, parseFormAddresses, type AddressEntry } from "@/lib/address";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", addresses: [] as string[] });
  const [showWalletModal, setShowWalletModal] = useState(false);

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

      {/* Wallet Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-wallet text-primary-500"></i> My Wallet
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div>
            <p className="text-sm text-gray-500 mb-1">Available Balance</p>
            <p className="text-3xl font-black text-gray-900">₹{user.walletBalance?.toLocaleString('en-IN') || '0'}</p>
          </div>
          <button 
            onClick={() => setShowWalletModal(true)}
            className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-qrcode"></i> Add Funds via UPI
          </button>
        </div>
      </div>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl relative">
            <button 
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Add Funds to Wallet</h3>
            <p className="text-sm text-gray-500 mb-6">Scan the QR code using any UPI app to pay.</p>
            
            <div className="bg-gray-100 p-4 rounded-xl mb-6 inline-block">
              <img src="/qr.jpeg" alt="UPI QR Code" className="w-48 h-48 object-contain mx-auto mix-blend-multiply" />
            </div>
            
            <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm text-left mb-6">
              <p className="font-bold mb-1"><i className="fa-solid fa-circle-info mr-1"></i> Important Step</p>
              <p>After successful payment, please share the screenshot with our admin on WhatsApp to update your wallet balance.</p>
            </div>
            
            <a 
              href="https://wa.me/919663574728?text=Hi,%20I%20have%20made%20a%20UPI%20payment%20to%20add%20funds%20to%20my%20wallet.%20Here%20is%20the%20screenshot:"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <i className="fa-brands fa-whatsapp text-lg"></i> Send Screenshot
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
