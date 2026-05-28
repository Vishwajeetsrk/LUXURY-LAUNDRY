"use client";


import HeroSection from "@/components/home/HeroSection";
import ContactFormSection from "@/components/home/ContactFormSection";
import FeatureCardsSection from "@/components/home/FeatureCardsSection";
import TextImageSections from "@/components/home/TextImageSections";
import ServiceCardsSection from "@/components/home/ServiceCardsSection";
import TrustBadgesSection from "@/components/home/TrustBadgesSection";
import StatsSection from "@/components/home/StatsSection";
import Link from "next/link";
import { useContent } from "@/context/ContentContext";

export default function HomePage() {
  const { getContent } = useContent();

  return (
    <>
      {/* 1. Hero Split Section */}
      <HeroSection />

      {/* 2. Let's Connect Form */}
      <ContactFormSection />

      {/* 3. Feature Cards - Your Journey Begins Here */}
      <FeatureCardsSection />

      {/* 4. Text + Image Sections */}
      <TextImageSections />

      {/* 5. Service Cards with Pricing */}
      <ServiceCardsSection />

      {/* 6. Title Banner */}
      <section className="py-20 hero-gradient text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 w-24 h-24 border-2 border-white rounded-full" />
          <div className="absolute bottom-4 right-8 w-16 h-16 border-2 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-8 h-8 border border-white rounded-full" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-black mb-4">
            {getContent("banner_title", "Fresh Clothes. Premium Care. Doorstep Delivery.")}
          </h2>
          <p className="text-blue-100 text-lg mb-2">
            {getContent("banner_subtitle", "Experience a smarter laundry service with expert fabric care, free pickup, and fast delivery.")}
          </p>
          <p className="text-blue-100 text-base mb-8">
            From everyday wear to luxury garments, we make laundry simple,
            hygienic and hassle-free.
          </p>
          <Link
            href="/contactus"
            className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Book Free Pickup Now
            <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      </section>

      {/* 7. Trust Badges */}
      <TrustBadgesSection />

      {/* 8. Stats Section */}
      <StatsSection />
    </>
  );
}
