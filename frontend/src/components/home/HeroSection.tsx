"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useContent } from "@/context/ContentContext";

export default function HeroSection() {
  const { getContent } = useContent();

  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-stretch overflow-hidden bg-white">
      <div className="w-full flex flex-col lg:flex-row">
        {/* Left: Background Image Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative lg:w-7/12 min-h-[300px] lg:min-h-0 order-2 lg:order-1"
        >
          <Image
            src="/images/hero_laundry.png"
            alt="Premium laundry service"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay on right edge for smooth blend */}
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-white hidden lg:block" />
        </motion.div>

        {/* Right: Content */}
        <div className="lg:w-5/12 flex items-center px-6 py-16 lg:py-24 lg:px-12 xl:px-16 order-1 lg:order-2 bg-white">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="max-w-lg"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
              <i className="fa-solid fa-star text-primary-500" />
              Premium Laundry Service
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4">
              {getContent("hero_title", "Premium Laundry Experience")}
            </h1>

            <p className="text-gray-600 text-base leading-relaxed mb-4">
              {getContent("hero_subtitle", "Experience premium laundry and dry cleaning services with free doorstep pickup and delivery.")}
            </p>

            <p className="text-gray-700 text-base font-medium leading-relaxed mb-8">
              From everyday wear to luxury garments, our expert team ensures
              hygienic cleaning, fast service, and a hassle-free experience
              every time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/our-services"
                className="btn-primary-lg inline-flex items-center gap-2"
              >
                {getContent("hero_cta", "Explore Services")}
                <i className="fa-solid fa-arrow-right text-sm" />
              </Link>
              <Link
                href="/contactus"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded transition-all duration-200"
              >
                Book Free Pickup
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-3 gap-4">
              {[
                { value: "12k+", label: "Orders Done" },
                { value: "98%", label: "Satisfaction" },
                { value: "5+", label: "Services" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-black text-primary-500">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
