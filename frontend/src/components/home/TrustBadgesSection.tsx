"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const trustItems = [
  {
    icon: <i className="fa-solid fa-shield-halved text-green-500" aria-hidden="true" />,
    title: "100% Safe & Hygienic Cleaning",
  },
  {
    icon: <i className="fa-solid fa-bolt text-yellow-500" aria-hidden="true" />,
    title: "24–48 Hour Express Service",
  },
  {
    icon: <i className="fa-solid fa-truck-fast text-blue-500" aria-hidden="true" />,
    title: "Free Pickup & Drop on Orders Above ₹4,999",
  },
  {
    icon: <i className="fa-solid fa-wallet text-purple-500" aria-hidden="true" />,
    title: "₹100 Pickup Charge for Orders up to ₹4,999",
  },
  {
    icon: <i className="fa-solid fa-headset text-orange-500" aria-hidden="true" />,
    title: "Trusted Customer Service",
  },
  {
    icon: <i className="fa-solid fa-wand-magic-sparkles text-pink-500" aria-hidden="true" />,
    title: "Premium Fabric Care",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  },
};

export default function TrustBadgesSection() {
  return (
    <section className="py-16 lg:py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center lg:text-left"
        >
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">
            Trusted By Thousands Of Happy Customers
          </h2>
          <p className="text-gray-600 text-lg font-medium mb-4 max-w-2xl mx-auto lg:mx-0">
            We provide premium laundry services with quality, trust and customer
            satisfaction at every step.
          </p>
          <Link
            href="/our-services"
            className="inline-flex items-center gap-2 text-primary-500 font-bold hover:text-primary-600 text-sm transition-colors duration-200 group"
          >
            See our case studies
            <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Trust Badge Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6"
        >
          {trustItems.map((item, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-primary-500/10 hover:border-primary-200 transition-colors duration-200 flex flex-col items-center justify-center gap-3 min-h-[140px]"
            >
              <div className="text-3xl bg-gray-50 w-14 h-14 rounded-full flex items-center justify-center mb-1">
                {item.icon}
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-800 leading-tight">
                {item.title}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
