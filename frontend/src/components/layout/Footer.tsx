import Link from "next/link";
import Image from "next/image";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/our-services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about-us", label: "About Us" },
  { href: "/contactus", label: "Contact Us" },
  { href: "/contactus", label: "Book Pickup" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Quick Links */}
          <div>
            <p className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </p>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About LuxWash */}
          <div>
            <div className="flex items-center mb-4">
              <Image 
                src="/logo.png"
                alt="Luxury Laundry"
                width={300}
                height={80}
                className="w-auto h-20 object-contain filter invert brightness-0"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              LuxWash Premium Laundry provides expert fabric care with modern
              cleaning technology, doorstep pickup, and fast delivery service.
              We focus on quality, hygiene, and customer satisfaction with every
              order.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://wa.me/919663574728"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-green-600 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="WhatsApp"
              >
                <i className="fa-brands fa-whatsapp text-xs" />
              </a>
            </div>
          </div>

          {/* Connect With Us */}
          <div>
            <p className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Connect With Us
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot text-primary-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Shop No. 504, Bagrota, Ajmer Road, Jaipur, Rajasthan
                </span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fa-solid fa-envelope text-primary-500 flex-shrink-0" />
                <a
                  href="mailto:support@luxwash.com"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                >
                  support@luxwash.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <i className="fa-solid fa-phone text-primary-500 flex-shrink-0" />
                <a
                  href="tel:+919663574728"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                >
                  +91-9663574728
                </a>
              </li>
              <li className="flex items-center gap-3">
                <i className="fa-solid fa-clock text-primary-500 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Open All Week: 10:00 AM – 8:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} LUXURY LAUNDRY. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-gray-300 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-300 transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
