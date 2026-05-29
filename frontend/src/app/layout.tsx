import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
import { ThemeProvider } from "../components/ui/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className={`${inter.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-primary-100 selection:text-primary-900 transition-colors duration-200`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <ContentProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </ContentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
