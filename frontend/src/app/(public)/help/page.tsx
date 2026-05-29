import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help | LUXURY LAUNDRY",
  description: "Frequently asked questions and customer support for LuxWash Premium Laundry.",
};

const faqs = [
  {
    q: "How do I book a laundry pickup?",
    a: "You can book a pickup by calling us at +91-9663574728, filling out our Contact form, or through WhatsApp. Our team will schedule a convenient pickup time for you.",
  },
  {
    q: "What areas do you serve in Jaipur?",
    a: "We currently serve all major areas across Jaipur including Mansarovar, Vaishali Nagar, Malviya Nagar, C-Scheme, Tonk Road, Ajmer Road, and surrounding localities.",
  },
  {
    q: "Is there a minimum order requirement?",
    a: "There is no minimum order. However, orders above ₹4,999 qualify for FREE pickup & delivery. For orders up to ₹4,999, a ₹100 pickup charge applies.",
  },
  {
    q: "How long does it take to get my clothes back?",
    a: "Standard turnaround is 24–48 hours for wash & fold/iron services. Dry cleaning takes 48–72 hours. Express service is available for urgent orders.",
  },
  {
    q: "What detergents do you use?",
    a: "We use premium, skin-friendly detergents and fabric softeners. For delicate garments, we use specialized cleaning agents that are gentle on fabrics.",
  },
  {
    q: "Do you handle delicate/luxury garments?",
    a: "Yes! We specialize in caring for luxury garments including silk sarees, designer lehengas, suits, and bridal wear with professional dry cleaning technology.",
  },
  {
    q: "What if my clothes get damaged?",
    a: "We take utmost care with every garment. In the rare event of damage, we have a damage protection policy and will compensate fairly. Please report within 24 hours of delivery.",
  },
  {
    q: "Can I track my order?",
    a: "Yes! Once you place an order, you'll receive status updates via SMS/WhatsApp at every stage — pickup, processing, ready, and delivery.",
  },
];

export default function HelpPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-48 flex items-center bg-gray-800"
        style={{ backgroundImage: "url('/images/delivery_service.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black text-white">Help & Support</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <i className="fa-solid fa-chevron-right text-xs" />
            <span className="text-white">Help</span>
          </div>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="tel:+919663574728" className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors duration-200">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-phone text-white text-sm" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Call Us</div>
                <div className="text-sm font-bold text-gray-900">+91-9663574728</div>
              </div>
            </a>
            <a href="mailto:support@luxwash.com" className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-200">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-envelope text-white text-sm" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Email</div>
                <div className="text-sm font-bold text-gray-900">support@luxwash.com</div>
              </div>
            </a>
            <a href="https://wa.me/919663574728" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors duration-200">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-brands fa-whatsapp text-white text-sm" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">WhatsApp</div>
                <div className="text-sm font-bold text-gray-900">Chat with us</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-500">Find answers to common questions about our laundry services.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 group">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  <i className="fa-solid fa-chevron-down text-xs text-gray-400 group-open:rotate-180 transition-transform duration-200 flex-shrink-0" />
                </summary>
                <div className="px-5 pb-5 pt-0">
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h3 className="text-2xl font-black text-gray-900 mb-3">Still have questions?</h3>
          <p className="text-gray-500 mb-6">Our support team is here to help you with anything.</p>
          <Link href="/contactus" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200">
            Contact Us <i className="fa-solid fa-arrow-right text-sm" />
          </Link>
        </div>
      </section>
    </>
  );
}
