"use client";

import { useEffect, useState } from "react";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const downloadInvoice = async (invoiceId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const res = await fetch(`${API_URL}/api/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${invoiceId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setSubmittingReview(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm)
      });
      if (res.ok) {
        alert("Thank you for your review! It will be published after moderation.");
        setReviewModalOpen(false);
        setReviewForm({ rating: 5, comment: "" });
      } else {
        const data = await res.json();
        alert(data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="py-3 px-6 font-medium">Order ID</th>
              <th className="py-3 px-6 font-medium">Service</th>
              <th className="py-3 px-6 font-medium">Quantity</th>
              <th className="py-3 px-6 font-medium">Date</th>
              <th className="py-3 px-6 font-medium">Status</th>
              <th className="py-3 px-6 font-medium text-right">Amount / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">You haven't placed any orders yet.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">
                    <a href={`/dashboard/orders/${order.id}`} className="hover:text-primary-600 hover:underline">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </a>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{order.service?.name}</td>
                  <td className="py-4 px-6 text-gray-600">{order.quantity} {order.service?.unit}</td>
                  <td className="py-4 px-6 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                      order.status === "PROCESSING" ? "bg-blue-100 text-blue-800" :
                      order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium flex items-center justify-end gap-4">
                    ₹{order.totalAmount}
                    <div className="flex items-center gap-2">
                      <a 
                        href={`/dashboard/orders/${order.id}`}
                        className="text-xs font-semibold px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Track Order
                      </a>
                      {order.status === "DELIVERED" && (
                        <button
                          onClick={() => setReviewModalOpen(true)}
                          className="text-xs font-semibold px-3 py-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 rounded-md transition-colors"
                        >
                          <i className="fa-solid fa-star text-[10px] mr-1" /> Leave Review
                        </button>
                      )}
                      {order.invoice?.id && (
                        <button 
                          onClick={() => downloadInvoice(order.invoice.id)}
                          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 p-1.5"
                          title="Download Invoice"
                        >
                          <i className="fa-solid fa-file-pdf"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {reviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121826] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Leave a Review</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">How was your experience with Luxury Laundry?</p>
              
              <div className="flex items-center gap-2 mb-6 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className={`text-3xl transition-transform hover:scale-110 ${reviewForm.rating >= star ? 'text-primary-500' : 'text-gray-200 dark:text-gray-700'}`}
                  >
                    <i className="fa-solid fa-star" />
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Comment (Optional)</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  rows={4}
                  placeholder="Tell us what you liked..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={submittingReview}
                  className="flex-1 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
