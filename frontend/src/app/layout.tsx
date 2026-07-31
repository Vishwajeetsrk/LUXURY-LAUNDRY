import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Premium Laundry & Dry Cleaning in Jaipur | LUXURY LAUNDRY",
    template: "%s | LUXURY LAUNDRY",
  },
  description:
    "LuxWash Premium Laundry — Jaipur's trusted laundry service with free doorstep pickup & delivery. Wash & Fold from ₹145/kg, Dry Cleaning, Steam Iron & more. 100% hygienic, 24-48hr turnaround.",
  keywords: [
    "laundry service Jaipur",
    "dry cleaning Jaipur",
    "pickup delivery laundry",
    "premium laundry",
    "wash and fold",
    "steam iron laundry",
    "LuxWash",
    "laundry near me",
  ],
  authors: [{ name: "LUXURY LAUNDRY" }],
  metadataBase: new URL("https://luxurylaundryjaipur.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://luxurylaundryjaipur.com",
    siteName: "LUXURY LAUNDRY",
    title: "Premium Laundry & Dry Cleaning in Jaipur | LUXURY LAUNDRY",
    description:
      "Jaipur's trusted laundry service with free doorstep pickup & delivery. Wash & Fold, Dry Cleaning, Steam Iron & more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Laundry & Dry Cleaning in Jaipur | LUXURY LAUNDRY",
    description:
      "Jaipur's trusted laundry service with free doorstep pickup & delivery.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

import { CartProvider } from "../context/CartContext";
import { ContentProvider } from "../context/ContentContext";
import StructuredData from "../components/seo/StructuredData";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <StructuredData />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className={`${inter.variable} antialiased bg-gray-50 text-gray-900 font-sans selection:bg-primary-100 selection:text-primary-900 transition-colors duration-200`}>
        <ContentProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ContentProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
