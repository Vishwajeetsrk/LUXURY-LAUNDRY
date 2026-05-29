"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { buildApiUrl } from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        const res = await fetch(buildApiUrl("/api/auth/me"), {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setUser(data);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
      }
    };
    checkAuth();
    return () => { cancelled = true; };
  }, [router]);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const links = [
    { href: "/dashboard", icon: "fa-solid fa-chart-pie", label: "Overview" },
    { href: "/dashboard/orders", icon: "fa-solid fa-shirt", label: "My Orders & History" },
    { href: "/dashboard/invoices", icon: "fa-solid fa-file-invoice", label: "My Invoices" },
    { href: "/dashboard/profile", icon: "fa-solid fa-user", label: "My Profile" },
    { href: "/contactus", icon: "fa-solid fa-headset", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-primary-600">LuxWash</span>
          </Link>
        </div>
        <div className="p-4 flex-grow">
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 ml-2">Customer Dashboard</div>
          <nav className="space-y-1">
            {links.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                    active ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <i className={`${link.icon} w-5 text-center`}></i>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={async () => {
              try { await fetch(buildApiUrl("/api/auth/logout"), { method: "POST", credentials: "include" }); } catch {}
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.replace("/login");
            }}
            className="flex items-center gap-3 px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl w-full transition-colors"
          >
            <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 p-4 md:px-8 md:py-6 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8 flex-grow overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
