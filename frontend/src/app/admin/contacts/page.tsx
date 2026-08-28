"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);

  const API = API_URL;

  const fetchContacts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/contact`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setContacts(await res.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [API]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const deleteContact = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/api/contact/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Contact Inquiries</h1>
        <p className="text-sm text-gray-500 mt-1">{contacts.length} form submissions received</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Date</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>{[...Array(5)].map((_, j) => (<td key={j}><div className="h-4 w-20 skeleton rounded" /></td>))}</tr>
                  ))
                ) : contacts.length > 0 ? (
                  contacts.map((c) => (
                    <tr key={c.id} className={selected?.id === c.id ? "bg-primary-50" : ""}>
                      <td className="font-medium">{c.name}</td>
                      <td className="text-xs">{c.email}</td>
                      <td className="max-w-[200px] truncate">{c.subject}</td>
                      <td className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelected(c)} className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors duration-200" title="View"><i className="fa-solid fa-eye text-sm" /></button>
                          <button onClick={() => deleteContact(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200" title="Delete"><i className="fa-solid fa-trash text-sm" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-12">No inquiries yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Inquiry Details</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-sm">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</label>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{selected.name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                  <p className="text-sm text-gray-900 mt-0.5">
                    <a href={`mailto:${selected.email}`} className="text-primary-500 hover:underline">{selected.email}</a>
                  </p>
                </div>
                {selected.phone && (
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</label>
                    <p className="text-sm text-gray-900 mt-0.5">{selected.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject</label>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{selected.subject}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Message</label>
                  <p className="text-sm text-gray-600 mt-0.5 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Submitted</label>
                  <p className="text-sm text-gray-900 mt-0.5">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 text-sm mt-4">
                  <i className="fa-solid fa-reply mr-1.5" /> Reply via Email
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <i className="fa-solid fa-envelope text-3xl mb-3 block opacity-30" />
              <p className="text-sm">Select an inquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
