"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface WalletTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchWallet = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login?redirect=/dashboard/wallet");
        return;
      }
      const res = await fetch(`${API}/api/wallet/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.walletBalance || 0);
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API, router]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">My Wallet</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your laundry credits and view transaction history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-primary-100 mb-2">
              <i className="fa-solid fa-wallet"></i>
              <span className="text-sm font-semibold uppercase tracking-wider">Available Balance</span>
            </div>
            <div className="text-5xl font-black mb-4">
              ₹{balance.toLocaleString('en-IN')}
            </div>
            <Link href="/pricing" className="block w-full py-2.5 px-4 bg-white/20 hover:bg-white/30 transition-colors rounded-xl text-center font-semibold text-sm backdrop-blur-sm border border-white/10">
              Buy More Credits
            </Link>
          </div>
        </div>

        {/* Info Card */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
          <h2 className="font-bold text-gray-900 mb-2 text-lg">How Wallet Works</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-gray-600">
              <div className="mt-0.5 bg-green-100 text-green-600 p-1 rounded-full"><i className="fa-solid fa-check text-[10px]"></i></div>
              <span>Wallet credits can be used seamlessly during checkout.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-600">
              <div className="mt-0.5 bg-green-100 text-green-600 p-1 rounded-full"><i className="fa-solid fa-check text-[10px]"></i></div>
              <span>Buy a package from our pricing page to add credits at discounted rates.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-600">
              <div className="mt-0.5 bg-green-100 text-green-600 p-1 rounded-full"><i className="fa-solid fa-check text-[10px]"></i></div>
              <span>Credits never expire. Enjoy automatic discounts on all orders based on your active package.</span>
            </li>
          </ul>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
              <i className="fa-solid fa-qrcode text-primary-500"></i> Add Funds to Wallet
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="w-24 h-24 bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex-shrink-0 relative overflow-hidden">
                <img src="/images/upi_qr.png" alt="UPI QR Code" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium mb-1">Scan the QR code using any UPI app to pay.</p>
                <p className="text-sm text-gray-900 font-bold mb-3">UPI ID: luxwash@upi</p>
                <div className="bg-blue-50 text-blue-700 p-2.5 rounded-lg text-xs flex items-start gap-2 shadow-sm border border-blue-100">
                  <i className="fa-brands fa-whatsapp mt-0.5 text-blue-600 text-sm"></i>
                  <span>Send a screenshot of your payment to the admin on WhatsApp. Credits will be reflected here after confirmation.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Transaction History</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-primary-500 mb-2"></i>
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <i className="fa-solid fa-receipt text-2xl text-gray-400"></i>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">No Transactions Yet</h3>
            <p className="text-gray-500 text-sm">When you use your wallet, the history will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fa-solid ${tx.type === 'CREDIT' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{tx.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className={`font-black text-right ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
