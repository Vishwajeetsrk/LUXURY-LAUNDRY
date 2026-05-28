"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function useCountUp(end: number, duration: number = 2000, suffix: string = "") {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return { count, ref };
}

export default function StatsSectionComponent() {
  const orders = useCountUp(12000, 2000);
  const satisfaction = useCountUp(98, 1500);
  const services = useCountUp(5, 1000);

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Description */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Our Laundry Success Journey
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-6">
              Delivering premium laundry and dry cleaning services with quality,
              trust, and customer satisfaction every day.
            </p>
            <Link
              href="/our-services"
              className="inline-flex items-center gap-2 bg-primary-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200 w-fit"
            >
              Explore Services
              <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>

          {/* Right: Stats Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Orders */}
            <div ref={orders.ref} className="bg-primary-500 rounded-2xl p-8 text-white">
              <div className="text-5xl font-black mb-2">
                {orders.count > 999
                  ? `${(orders.count / 1000).toFixed(1)}k`
                  : orders.count}
              </div>
              <div className="font-bold text-lg mb-1">Orders Completed</div>
              <p className="text-primary-100 text-sm">
                Successfully cleaned and delivered thousands of garments with
                premium care.
              </p>
            </div>

            {/* Satisfaction */}
            <div ref={satisfaction.ref} className="bg-gray-900 rounded-2xl p-8 text-white">
              <div className="text-5xl font-black mb-2">
                {satisfaction.count}%
              </div>
              <div className="font-bold text-lg mb-1">Customer Satisfaction</div>
              <p className="text-gray-400 text-sm">
                Boost your pipeline with an increase in potential leads.
              </p>
            </div>

            {/* Services — full width */}
            <div ref={services.ref} className="sm:col-span-2 bg-blue-50 rounded-2xl p-8">
              <div className="text-5xl font-black text-gray-900 mb-2">
                {services.count}+
              </div>
              <div className="font-bold text-gray-800 text-lg mb-1">
                Premium Services
              </div>
              <p className="text-gray-600 text-sm">
                Wash & Fold, Steam Iron, Dry Cleaning, Shoe Spa & Home Care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
