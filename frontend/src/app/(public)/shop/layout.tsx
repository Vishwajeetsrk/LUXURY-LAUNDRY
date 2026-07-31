import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Laundry Service Packs",
  description:
    "Buy premium laundry service packs online from LuxWash Jaipur. Wash & Fold, Dry Cleaning, and combo packs with doorstep pickup and delivery.",
  keywords: ["buy laundry pack", "laundry service online", "wash and fold pack", "dry cleaning pack Jaipur"],
  alternates: { canonical: "https://luxurylaundryjaipur.com/shop" },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
