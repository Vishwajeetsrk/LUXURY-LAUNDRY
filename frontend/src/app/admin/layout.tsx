"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ROLE_LABELS,
  canAccessAdminPath,
  hasPermission,
  isPanelRole,
  type Permission,
} from "@/lib/permissions";
import { buildApiUrl } from "@/lib/api";

const sidebarLinks: { href: string; label: string; icon: string; permission: Permission }[] = [
  { href: "/admin", label: "Dashboard", icon: "fa-solid fa-chart-line", permission: "dashboard:read" },
  { href: "/admin/orders", label: "Orders", icon: "fa-solid fa-box", permission: "orders:read" },
  { href: "/admin/invoices", label: "Invoices", icon: "fa-solid fa-file-invoice", permission: "invoices:read" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "fa-solid fa-crown", permission: "subscriptions:read" },
  { href: "/admin/customers", label: "Customers", icon: "fa-solid fa-users", permission: "customers:read" },
  { href: "/admin/services", label: "Services", icon: "fa-solid fa-concierge-bell", permission: "services:read" },
  { href: "/admin/packages", label: "Packages", icon: "fa-solid fa-box-open", permission: "packages:read" },
  { href: "/admin/offers", label: "Offers", icon: "fa-solid fa-tags", permission: "packages:read" },
  { href: "/admin/shop", label: "Shop Products", icon: "fa-solid fa-cart-shopping", permission: "shop:read" },
  { href: "/admin/whatsapp", label: "WhatsApp Logs", icon: "fa-brands fa-whatsapp", permission: "whatsapp:read" },
  { href: "/admin/content", label: "Content", icon: "fa-solid fa-pen-to-square", permission: "content:write" },
  { href: "/admin/contacts", label: "Inquiries", icon: "fa-solid fa-envelope", permission: "contacts:read" },
  { href: "/admin/settings", label: "Settings", icon: "fa-solid fa-gear", permission: "settings:write" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  const visibleLinks = useMemo(
    () => sidebarLinks.filter((link) => user && hasPermission(user.role, link.permission)),
    [user]
  );

  useEffect(() => {
    let cancelled = false;

    const verifyPanelUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(buildApiUrl("/api/auth/me"), {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Unable to verify user");

        const currentUser = await res.json();
        if (!isPanelRole(currentUser.role)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        const panelUser = {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
        };
        localStorage.setItem("user", JSON.stringify(panelUser));

        if (cancelled) return;
        setUser(panelUser);

        if (!canAccessAdminPath(panelUser.role, pathname)) {
          const fallback = sidebarLinks.find((l) => hasPermission(panelUser.role, l.permission));
          router.replace(fallback?.href || "/login");
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
      }
    };

    verifyPanelUser();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch(buildApiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const roleLabel = ROLE_LABELS[user.role] || user.role;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-100 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-10 object-contain" />
          </Link>
          <button className="ml-auto lg:hidden p-1" onClick={() => setSidebarOpen(false)}>
            <i className="fa-solid fa-xmark text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {visibleLinks.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary-500 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <i className={`${link.icon} w-4 text-center`} />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold text-sm">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-primary-50 text-primary-700 rounded-full">
                {roleLabel}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors duration-200"
              title="Logout"
            >
              <i className="fa-solid fa-right-from-bracket text-sm" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 flex-shrink-0">
          <button
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="fa-solid fa-bars" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-medium text-gray-500">{roleLabel}</span>
            <Link
              href="/"
              target="_blank"
              className="text-sm text-gray-500 hover:text-primary-500 transition-colors duration-200 flex items-center gap-1.5"
            >
              <i className="fa-solid fa-external-link text-xs" />
              View Site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
