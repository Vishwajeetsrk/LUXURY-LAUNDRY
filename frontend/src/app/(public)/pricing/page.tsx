"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Plan data
const pricingPlans = [
  {
    name: "SILVER PACKAGE",
    subtitle: "Value Pack",
    price: "2,000",
    unit: "",
    description: "Ideal for regular clothes dry cleaning and washing",
    features: [
      "20% OFF all laundry & dry cleaning",
      "Daily Wear (Shirt, T-Shirt, Trouser, Jeans)",
      "Regular Laundry (Wash & Fold, Wash & Steam Iron)",
      "Bed sheets & regular curtains",
    ],
    cta: "Select Silver",
    popular: false,
    color: "border-gray-200",
    btnClass: "border-2 border-gray-400 text-gray-700 hover:bg-gray-100",
  },
  {
    name: "GOLD PACKAGE",
    subtitle: "Premium & Household",
    price: "5,000",
    unit: "",
    description: "Best for regular clothes + winter wear & costly garments",
    features: [
      "25% OFF on premium items & extra benefits",
      "Saree, Suits & Heavy Dresses",
      "Woolens (Sweaters, Jackets, Sweatshirts)",
      "Blankets & Quilts (Kambal & Razai)",
    ],
    cta: "Select Gold",
    popular: true,
    color: "border-yellow-400",
    btnClass: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-yellow-500/30 shadow-lg",
  },
  {
    name: "PREMIUM PACKAGE",
    subtitle: "Luxury & Delicate Care",
    price: "10,000",
    unit: "",
    description: "For high-end customers (lehenga, leather, shoes, bags)",
    features: [
      "30% OFF on luxury items",
      "Free Express Delivery (24 Hours)",
      "Heavy Designer Wear (Lehenga, Achkan)",
      "Leather Jackets & Pashmina Shawls",
      "Premium Footwear & Luxury Handbags",
    ],
    cta: "Select Premium",
    popular: false,
    color: "border-purple-300",
    btnClass: "border-2 border-purple-500 text-purple-600 hover:bg-purple-50",
  },
];

const additionalPricing = [
  { service: "Trouser/Jeans (Dry Clean)", price: "₹100" },
  { service: "Shirt/T-Shirt (Dry Clean / Steam Iron)", price: "₹100 / ₹20" },
  { service: "Kurta/Pyjama (Dry Clean / Steam Iron)", price: "₹120+ / ₹30+" },
  { service: "Saree/Blouse (Dry Clean / Steam Iron)", price: "₹275+ / ₹70+" },
  { service: "Lehenga (Dry Clean / Steam Iron)", price: "₹550+ / ₹130+" },
  { service: "Sports / Canvas / Sneaker", price: "₹350" },
  { service: "Leather Shoes", price: "₹450" },
  { service: "Carpet", price: "₹45 / sq.ft" },
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (plan: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setLoadingPlan(plan.name);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const numericPrice = plan.price.replace(/,/g, '');
      
      const res = await fetch(`${API_URL}/api/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: plan.name,
          price: numericPrice
        })
      });

      if (!res.ok) {
        throw new Error("Failed to request subscription");
      }

      const data = await res.json();
      
      // Redirect to WhatsApp
      if (data.whatsappLink) {
        window.open(data.whatsappLink, "_blank");
      } else {
        alert("Subscription requested successfully! Please contact the admin.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      {/* Page Hero */}
      <section
        className="relative h-48 flex items-center bg-gray-800"
        style={{
          backgroundImage: "url('/images/wash_fold.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black text-white">Pricing</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <i className="fa-solid fa-chevron-right text-xs" />
            <span className="text-white">Pricing Plan</span>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            No hidden fees, no surprises. What you see is what you pay. Free
            pickup & delivery on orders above ₹10,000.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border-2 ${plan.color} p-8 flex flex-col ${
                  plan.popular ? "shadow-xl scale-105" : "shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                {/* Plan name */}
                <div className="mb-6">
                  <h3 className="text-xl font-black text-gray-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500">{plan.subtitle}</p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-sm text-gray-500 font-medium">₹</span>
                  <span className="text-5xl font-black text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-500">{plan.unit}</span>
                </div>

                <p className="text-sm text-gray-500 mb-6">{plan.description}</p>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-sm text-gray-700"
                    >
                      <i className="fa-solid fa-check text-primary-500 mt-0.5 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loadingPlan === plan.name}
                  className={`w-full text-center py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${plan.btnClass} ${loadingPlan === plan.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loadingPlan === plan.name ? (
                    <><i className="fa-solid fa-spinner fa-spin mr-2" /> Processing...</>
                  ) : plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Pricing */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">
            Additional Services Pricing
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {additionalPricing.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-6 py-4 ${
                  i !== additionalPricing.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span className="text-gray-700 font-medium text-sm">
                  {item.service}
                </span>
                <span className="text-primary-600 font-bold text-sm">
                  {item.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pickup Policy */}
      <section className="py-14 bg-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-green-100 flex items-center justify-center mx-auto mb-5 text-green-500 text-3xl">
                <i className="fa-solid fa-truck-fast" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">
                Free Pickup & Delivery
              </h3>
              <p className="text-sm text-gray-600">
                On orders above <strong className="text-green-700">₹10,000</strong>
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-amber-100 flex items-center justify-center mx-auto mb-5 text-amber-500 text-3xl">
                <i className="fa-solid fa-wallet" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">₹100 Pickup Charge</h3>
              <p className="text-sm text-gray-600">
                For orders <strong className="text-amber-700">less than ₹10,000</strong>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 hero-gradient text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-4">Start Your First Order</h2>
          <p className="text-blue-100 mb-8">
            Book a pickup today and experience premium laundry care at your
            doorstep.
          </p>
          <Link
            href="/contactus"
            className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg"
          >
            Book Free Pickup
          </Link>
        </div>
      </section>
    </>
  );
}
