import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description:
    "Transparent pricing for LuxWash Premium Laundry in Jaipur. Wash & Fold from ₹145/kg, Dry Cleaning from ₹299, and subscription plans with free pickup & delivery.",
  keywords: ["laundry pricing Jaipur", "laundry rates", "wash and fold price", "dry cleaning cost", "laundry subscription"],
  alternates: { canonical: "https://luxurylaundryjaipur.com/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
