import Image from "next/image";
import Link from "next/link";

export default function TextImageSections() {
  return (
    <>
      {/* Section 1: Text Left, Image Right */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-3">
                Premium Service
              </p>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-5 leading-tight">
                Need Premium Laundry Service?
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                Book a hassle-free laundry pickup and enjoy premium dry cleaning
                and fabric care at your doorstep. Our expert team ensures fast,
                hygienic, and high-quality service for every garment.
              </p>
              <p className="text-gray-600 text-base leading-relaxed mb-8">
                From everyday wear to luxury clothing, we make laundry simple,
                convenient, and stress-free.
              </p>
              <Link
                href="/contactus"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded hover:bg-gray-800 transition-colors duration-200"
              >
                Book Free Pickup
                <i className="fa-solid fa-arrow-right text-sm" />
              </Link>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/delivery_service.png"
                  alt="Free pickup and delivery service"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary-500 rounded-2xl opacity-10" />
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Image Left, Text Right */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/hero_laundry.png"
                  alt="Laundry made simple"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary-500 rounded-full opacity-10" />
              <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-blue-200 rounded-2xl opacity-30" />
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <p className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-3">
                Simple & Convenient
              </p>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-5 leading-tight">
                Laundry Made Simple
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                Enjoy premium laundry and dry cleaning services with free
                doorstep pickup and fast delivery. We provide expert garment
                care with modern cleaning technology.
              </p>
              <p className="text-gray-600 text-base leading-relaxed mb-8">
                From daily wear to premium clothes, our team ensures freshness,
                hygiene and top-quality care with every wash.
              </p>

              {/* Feature list */}
              <ul className="space-y-3 mb-8">
                {[
                  "Expert fabric care for all garment types",
                  "Free pickup & delivery above ₹10,000",
                  "24–48 hour express turnaround",
                  "100% safe and hygienic process",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <i className="fa-solid fa-check-circle text-primary-500" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/our-services"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded hover:bg-gray-800 transition-colors duration-200"
              >
                Explore our services
                <i className="fa-solid fa-arrow-right text-sm" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
