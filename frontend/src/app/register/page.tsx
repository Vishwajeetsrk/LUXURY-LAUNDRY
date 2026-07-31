"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err: any) {
      setError(
        err?.name === "TypeError"
          ? "Unable to connect to server. Please check backend is running and NEXT_PUBLIC_API_URL is correct."
          : err?.message || "Something went wrong connecting to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Luxury Laundry" width={300} height={100} className="mx-auto object-contain h-24" />
          </Link>
          <h1 className="mt-6 text-2xl font-black text-gray-900">Create an account</h1>
          <p className="mt-1 text-sm text-gray-500">Join LuxWash for premium laundry service</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="form-label">Full Name</label>
              <input id="reg-name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" placeholder="Your full name" />
            </div>
            <div>
              <label htmlFor="reg-email" className="form-label">Email</label>
              <input id="reg-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="reg-phone" className="form-label">Phone (optional)</label>
              <input id="reg-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="form-input" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <label htmlFor="reg-pass" className="form-label">Password</label>
              <input id="reg-pass" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="form-input" placeholder="Min 6 characters" />
            </div>
            <div>
              <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
              <input id="reg-confirm" type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="form-input" placeholder="Repeat password" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating account...</>
              ) : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-500 font-semibold hover:text-primary-600">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
