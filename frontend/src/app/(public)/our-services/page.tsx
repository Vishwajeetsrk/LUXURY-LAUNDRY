import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services | LUXURY LAUNDRY",
  description:
    "Explore our premium laundry services: Wash & Fold at ₹145/kg, Wash & Steam Iron at ₹165/kg, Dry Cleaning and more in Jaipur.",
};

const services = [
  {
    icon: "fa-solid fa-tshirt",
    name: "Wash & Fold",
    price: "₹145/kg",
    description:
      "Fresh washing with premium detergents and neat folding. Perfect for everyday clothes like shirts, trousers, t-shirts, and casuals.",
    features: [
      "Premium quality detergents",
      "Machine wash with care",
      "Neatly folded delivery",
      "Suitable for cotton & blends",
    ],
    image: "/images/wash_fold.png",
    color: "border-primary-500",
    badgeBg: "bg-primary-50",
    badgeText: "text-primary-700",
  },
  {
    icon: "fa-solid fa-fire",
    name: "Wash & Steam Iron",
    price: "₹165/kg",
    description:
      "Deep cleaning combined with professional steam ironing. Your clothes will look crisp, fresh, and perfectly pressed every time.",
    features: [
      "Deep wash cleaning",
      "Professional steam iron",
      "Crisp finish guaranteed",
      "Shirt & formal wear specialist",
    ],
    image: "/images/steam_iron.png",
    color: "border-yellow-500",
    badgeBg: "bg-yellow-50",
    badgeText: "text-yellow-700",
  },
  {
    icon: "fa-solid fa-star",
    name: "Premium Dry Cleaning",
    price: "₹100+/piece",
    description:
      "Expert care for delicate and luxury garments. Suits, sarees, lehengas, jackets — treated with the finest dry cleaning technology.",
    features: [
      "Chemical-free dry cleaning",
      "Expert handling of delicates",
      "Suits, sarees, lehengas",
      "Packaging in garment bags",
    ],
    image: "/images/dry_cleaning.png",
    color: "border-purple-500",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
  },
  {
    icon: "fa-solid fa-shoe-prints",
    name: "Shoe Spa",
    price: "₹149+/pair",
    description:
      "Complete shoe cleaning and restoration service. We clean, deodorize, and polish all types of footwear to bring them back to life.",
    features: [
      "Deep clean & deodorize",
      "Polish & shine treatment",
      "All shoe types accepted",
      "Sole protection care",
    ],
    image: "/images/hero_laundry.png",
    color: "border-green-500",
    badgeBg: "bg-green-50",
    badgeText: "text-green-700",
  },
  {
    icon: "fa-solid fa-house",
    name: "Home Care Laundry",
    price: "₹89+/piece",
    description:
      "Professional cleaning for your home items — curtains, bedsheets, sofa covers, carpets, and more. Fresh home, happy life.",
    features: [
      "Curtains & bedsheets",
      "Sofa covers & carpets",
      "Sanitized & hygienic wash",
      "Large item specialists",
    ],
    image: "/images/delivery_service.png",
    color: "border-red-500",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Page Hero */}
      <section
        className="relative h-48 flex items-center bg-gray-800"
        style={{
          backgroundImage: "url('/images/hero_laundry.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black text-white">Services</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <i className="fa-solid fa-chevron-right text-xs" />
            <span className="text-white">Services</span>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Premium Laundry Services Tailored For You
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            From everyday laundry to premium dry cleaning, we offer a
            comprehensive range of garment care services with free doorstep
            pickup and fast delivery across Jaipur.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {services.map((service, i) => (
              <div
                key={i}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                  i % 2 === 1 ? "" : ""
                }`}
              >
                {/* Image */}
                <div className={`${i % 2 === 1 ? "lg:order-2" : "lg:order-1"}`}>
                  <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={`${i % 2 === 1 ? "lg:order-1" : "lg:order-2"}`}>
                  <div
                    className={`inline-flex items-center gap-2 ${service.badgeBg} ${service.badgeText} px-3 py-1 rounded-full text-sm font-semibold mb-4`}
                  >
                    <i className={service.icon} />
                    {service.name}
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl font-black text-gray-900">
                      {service.price.split("/")[0]}
                    </span>
                    <span className="text-gray-500 font-medium">
                      /{service.price.split("/")[1]}
                    </span>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <ul className="grid grid-cols-2 gap-2 mb-6">
                    {service.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <i className="fa-solid fa-check text-primary-500 text-xs flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/contactus"
                    className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    Book Now
                    <i className="fa-solid fa-arrow-right text-sm" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 hero-gradient text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black mb-4">
            Ready to Experience Premium Care?
          </h2>
          <p className="text-blue-100 mb-8">
            Book a free pickup today and get your first order delivered fresh to
            your doorstep.
          </p>
          <Link
            href="/contactus"
            className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg"
          >
            Book Free Pickup
            <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      </section>
    </>
  );
}
