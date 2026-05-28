import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Home | LUXURY LAUNDRY",
    template: "%s | LUXURY LAUNDRY",
  },
  description:
    "Experience premium laundry and dry cleaning services with free doorstep pickup and delivery. Expert fabric care in Jaipur.",
  keywords: [
    "laundry service",
    "dry cleaning",
    "pickup delivery",
    "premium laundry",
    "Jaipur",
    "LuxWash",
  ],
  authors: [{ name: "LUXURY LAUNDRY" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://luxurylaundryjaipur.com",
    siteName: "LUXURY LAUNDRY",
  },
};

import { CartProvider } from "../context/CartContext";
import { ContentProvider } from "../context/ContentContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900 font-sans selection:bg-primary-100 selection:text-primary-900">
        <ContentProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ContentProvider>
      </body>
    </html>
  );
}
