"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import { isPanelRole } from "@/lib/auth";
import { buildApiUrl } from "@/lib/api";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/our-services", label: "Services" },
  { href: "/pricing", label: "Pricing Plan" },
  { href: "/about-us", label: "About Us" },
  { href: "/help", label: "Help" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const syncUser = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(buildApiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-md" : "shadow-sm border-b border-gray-100"
        }`}
      >
        {/* Desktop Navbar */}
        <nav className="hidden xl:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Image src="/logo.png" alt="Jaipur Laundryy" width={140} height={40} className="object-contain" />
                </div>
              </Link>

              {/* Nav Links */}
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        pathname === link.href
                          ? "text-primary-500 bg-primary-50"
                          : "text-gray-700 hover:text-primary-500 hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Phone */}
                <a
                  href="tel:+919663574728"
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-500 transition-colors duration-200 px-3 py-2"
                >
                  <i className="fa-solid fa-phone text-xs" />
                  <span className="text-xs font-medium">9663574728</span>
                </a>

                {/* Cart */}
                <Link
                  href="/shop/cart"
                  className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-primary-500 transition-colors duration-200"
                  aria-label="Cart"
                >
                  <i className="fa-solid fa-cart-shopping text-base" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Auth State */}
                {user ? (
                  <div className="relative group">
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors py-2">
                      <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      Hi, {user.name?.split(" ")[0] || "User"}
                      <i className="fa-solid fa-chevron-down text-xs ml-1 text-gray-400 group-hover:text-primary-500 transition-colors"></i>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                      <div className="py-2">
                        {isPanelRole(user.role) && (
                          <Link href="/admin" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                            <i className="fa-solid fa-shield-halved w-5 text-center mr-2"></i> Admin Panel
                          </Link>
                        )}
                        <Link href="/dashboard" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                          <i className="fa-solid fa-chart-pie w-5 text-center mr-2"></i> Dashboard
                        </Link>
                        <Link href="/dashboard/profile" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                          <i className="fa-solid fa-gear w-5 text-center mr-2"></i> Settings
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center mr-2"></i> Logout
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                )}

                {/* Contact Us CTA */}
                <Link
                  href="/contactus"
                  className="btn-primary-lg py-2 px-4 rounded-md text-sm"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Navbar */}
        <nav className="xl:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="Jaipur Laundryy" width={120} height={32} className="object-contain" />
              </Link>

              <div className="flex items-center gap-2">
                {/* Cart mobile */}
                <Link
                  href="/shop/cart"
                  className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600"
                  aria-label="Cart"
                >
                  <i className="fa-solid fa-cart-shopping text-sm" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-xs rounded-full w-3.5 h-3.5 flex items-center justify-center text-[10px]">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Hamburger */}
                <button
                  onClick={() => setMobileOpen(true)}
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Open menu"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Jaipur Laundryy" width={120} height={32} className="object-contain" />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <input
              type="search"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200"
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center px-6 py-3.5 text-sm font-medium border-b border-gray-50 transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-primary-500 bg-primary-50"
                      : "text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Phone */}
        <div className="p-4 border-t border-gray-100">
          <a
            href="tel:+919663574728"
            className="flex items-center gap-2 text-sm text-gray-600 mb-3"
          >
            <i className="fa-solid fa-phone text-primary-500" />
            <span>9663574728</span>
          </a>

          {/* Mobile CTAs */}
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                {isPanelRole(user.role) && (
                  <Link
                    href="/admin"
                    className="w-full py-2.5 text-center text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors duration-200"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 text-center text-sm font-medium text-primary-600 border border-primary-200 rounded-md hover:bg-primary-50 transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 text-center text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors duration-200"
                >
                  Logout ({user.name?.split(" ")[0]})
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="w-full py-2.5 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Sign in
              </Link>
            )}
            <Link
              href="/contactus"
              className="w-full py-2.5 text-center text-sm font-semibold bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
