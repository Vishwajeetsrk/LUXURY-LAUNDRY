import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about LuxWash Premium Laundry — our story, mission, and commitment to premium fabric care, dry cleaning, and doorstep delivery in Jaipur, Rajasthan.",
  keywords: ["about LuxWash", "laundry company Jaipur", "premium laundry", "dry cleaning Jaipur", "fabric care"],
  alternates: { canonical: "https://luxurylaundryjaipur.com/about-us" },
};

const values = [
  {
    icon: "fa-solid fa-star",
    title: "Quality First",
    description:
      "We never compromise on the quality of cleaning. Every garment gets the care it deserves.",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "100% Hygienic",
    description:
      "All our equipment and processes are sanitized regularly for your safety and health.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: "fa-solid fa-clock",
    title: "Always On Time",
    description:
      "We respect your time. Pickup and delivery are always on schedule — no delays, no excuses.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: "fa-solid fa-heart",
    title: "Customer First",
    description:
      "Your satisfaction is our priority. We go the extra mile to make every experience exceptional.",
    color: "bg-red-50 text-red-600",
  },
];


export default function AboutPage() {
  return (
    <>
      {/* Page Hero */}
      <section
        className="relative h-48 flex items-center bg-gray-800"
        style={{
          backgroundImage: "url('/images/delivery_service.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black text-white">About us</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <i className="fa-solid fa-chevron-right text-xs" />
            <span className="text-white">About Us</span>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-3">
                Our Story
              </p>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-5 leading-tight">
                Premium Laundry, Reimagined for Modern Life
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                LuxWash Premium Laundry was founded with a simple mission: to
                take the hassle out of laundry so you can focus on what matters
                most. Located in the heart of Jaipur, we serve hundreds of
                families and businesses across the city.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We believe premium fabric care shouldn&apos;t be a luxury — it
                should be accessible, convenient, and affordable. That&apos;s
                why we built a service that comes to your doorstep, handles your
                clothes with expert care, and delivers them back fresh,
                hygienic, and perfectly finished.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                From everyday cotton wear to delicate silk sarees, luxurious
                suits and bridal lehengas — we treat every garment as if it were
                our own.
              </p>
              <Link
                href="/contactus"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Book a Pickup
                <i className="fa-solid fa-arrow-right text-sm" />
              </Link>
            </div>

            <div className="relative">
              <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/dry_cleaning.png"
                  alt="Our professional facility"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-primary-500 text-white rounded-xl p-4 shadow-lg">
                <div className="text-3xl font-black">5+</div>
                <div className="text-sm font-medium">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              Our Core Values
            </h2>
            <p className="text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${val.color} flex items-center justify-center mb-4`}
                >
                  <i className={`${val.icon} text-xl`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{val.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {val.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "12k+", label: "Orders Completed" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "5+", label: "Premium Services" },
              { value: "500+", label: "Happy Families" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-black mb-1">{stat.value}</div>
                <div className="text-blue-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
