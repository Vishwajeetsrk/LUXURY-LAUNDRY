import type { Metadata } from "next";
import ContactFormSection from "@/components/home/ContactFormSection";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us | LUXURY LAUNDRY",
  description:
    "Contact LuxWash Premium Laundry for bookings, inquiries, and support. Located in Jaipur, Rajasthan.",
};
export default function ContactPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="relative h-40 flex items-center bg-gray-800">
        <div className="absolute inset-0 bg-primary-900/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black text-white">Contact Us</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <i className="fa-solid fa-chevron-right text-xs" />
            <span className="text-white">Contact</span>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="tel:+919663574728"
              className="flex flex-col items-center gap-3 p-6 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors duration-200 text-center"
            >
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-phone text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">Call Us</div>
                <div className="text-primary-600 font-semibold text-base">
                  +91-9663574728
                </div>
              </div>
            </a>

            <a
              href="mailto:support@luxwash.com"
              className="flex flex-col items-center gap-3 p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-200 text-center"
            >
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-envelope text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">Email Us</div>
                <div className="text-green-700 font-semibold text-sm">
                  support@luxwash.com
                </div>
              </div>
            </a>

            <div className="flex flex-col items-center gap-3 p-6 bg-orange-50 rounded-xl text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-location-dot text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">Visit Us</div>
                <div className="text-orange-700 text-sm">
                  Shop No. 504, Bagrota,
                  <br />
                  Ajmer Road, Jaipur
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <ContactFormSection />

      {/* Map + Hours */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Hours */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <i className="fa-solid fa-clock text-primary-500" />
                Business Hours
              </h3>
              <div className="space-y-2">
                {[
                  { day: "Monday – Friday", hours: "10:00 AM – 8:00 PM" },
                  { day: "Saturday", hours: "10:00 AM – 8:00 PM" },
                  { day: "Sunday", hours: "10:00 AM – 8:00 PM" },
                ].map((item) => (
                  <div
                    key={item.day}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600">{item.day}</span>
                    <span className="font-semibold text-gray-900">
                      {item.hours}
                    </span>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Open All Week
                  </span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-primary-500" />
                Find Us
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Shop No. 504, Bagrota,
                <br />
                Ajmer Road,
                <br />
                Jaipur, Rajasthan
              </p>
              <a
                href="https://maps.google.com/?q=Bagrota+Ajmer+Road+Jaipur"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary-600 font-semibold hover:text-primary-700"
              >
                <i className="fa-solid fa-map" />
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
