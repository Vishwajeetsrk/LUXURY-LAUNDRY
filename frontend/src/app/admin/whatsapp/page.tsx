"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/invoices";

interface WhatsAppLog {
  id: string;
  phone: string;
  message: string;
  category: string;
  status: string;
  clickUrl?: string | null;
  createdAt: string;
}

export default function WhatsAppLogsPage() {
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<WhatsAppLog[]>("/api/whatsapp/logs")
      .then(setLogs)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load WhatsApp logs"))
      .finally(() => setLoading(false));
  }, []);

  const deleteLog = async (id: string) => {
    if (!confirm("Delete this WhatsApp log?")) return;
    try {
      const token = localStorage.getItem("token");
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${API}/api/whatsapp/logs/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">WhatsApp Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Order alerts, customer confirmations, and invoice share links.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Phone</th>
                <th>Category</th>
                <th>Status</th>
                <th>Message</th>
                <th>Date</th>
                <th>Link</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, row) => (
                <tr key={row}>{[...Array(7)].map((__, cell) => <td key={cell}><div className="h-4 w-20 skeleton rounded" /></td>)}</tr>
              )) : logs.length ? logs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono text-xs">{log.phone}</td>
                  <td><span className="px-2 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold">{log.category}</span></td>
                  <td>{log.status}</td>
                  <td className="max-w-[360px] truncate text-xs">{log.message}</td>
                  <td className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString("en-IN")}</td>
                  <td>{log.clickUrl ? <a href={log.clickUrl} target="_blank" className="text-green-600 text-xs font-semibold">Open</a> : "-"}</td>
                  <td className="text-right">
                    <button onClick={() => deleteLog(log.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200" title="Delete">
                      <i className="fa-solid fa-trash text-sm" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="text-center text-gray-400 py-12">No WhatsApp activity yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
