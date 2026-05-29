"use client";

import { useEffect, useState, useCallback } from "react";
import { usePanelUser } from "@/hooks/usePanelUser";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isPublished: boolean;
  createdAt: string;
  customer: {
    name: string;
    email: string;
  };
}

export default function AdminReviewsPage() {
  const { can } = usePanelUser();
  const canWrite = can("reviews:write");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchReviews = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/reviews/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const togglePublish = async (id: string, currentStatus: boolean) => {
    if (!canWrite) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/reviews/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !currentStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews(prev => prev.map(r => r.id === id ? { ...r, isPublished: updated.isPublished } : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteReview = async (id: string) => {
    if (!canWrite) return;
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Customer Reviews</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Moderate and publish reviews for the homepage</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121826] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4"><Skeleton className="h-10 w-full" /></td>
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <EmptyState icon="fa-comment-slash" title="No reviews yet" description="Customers haven't submitted any reviews." />
                  </td>
                </tr>
              ) : (
                reviews.map(review => (
                  <tr key={review.id}>
                    <td>
                      <div className="font-medium text-gray-900 dark:text-white">{review.customer.name}</div>
                      <div className="text-xs text-gray-500">{review.customer.email}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-primary-500 text-xs">
                        {review.rating} <i className="fa-solid fa-star" />
                      </div>
                    </td>
                    <td className="max-w-xs truncate" title={review.comment || ""}>
                      {review.comment || <span className="text-gray-400 italic">No comment</span>}
                    </td>
                    <td className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${review.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {review.isPublished ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      {canWrite && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => togglePublish(review.id, review.isPublished)}
                            className={`p-2 rounded-lg transition-colors text-xs font-medium ${review.isPublished ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10'}`}
                          >
                            {review.isPublished ? 'Hide' : 'Publish'}
                          </button>
                          <button onClick={() => deleteReview(review.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                            <i className="fa-solid fa-trash text-xs" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
