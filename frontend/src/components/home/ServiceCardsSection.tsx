import Image from "next/image";
import Link from "next/link";

const services = [
  {
    id: "wash-fold",
    name: "Wash & Fold",
    price: "₹145",
    unit: "/ kg",
    description:
      "Fresh washing, premium detergents and neat folding for your everyday clothes.",
    image: "/images/wash_fold.png",
    badge: "Most Popular",
    badgeColor: "bg-primary-500",
  },
  {
    id: "wash-iron",
    name: "Wash & Steam Iron",
    price: "₹165",
    unit: "/ kg",
    description:
      "Deep cleaning with crisp steam ironing for a perfectly finished look.",
    image: "/images/steam_iron.png",
    badge: "Premium",
    badgeColor: "bg-gold",
  },
  {
    id: "dry-cleaning",
    name: "Premium Dry Cleaning",
    price: "₹100",
    unit: "/ piece onwards",
    description:
      "Expert care for suits, sarees, jackets, lehengas and delicate garments with premium fabric treatment.",
    image: "/images/dry_cleaning.png",
    badge: "Luxury",
    badgeColor: "bg-purple-600",
  },
];

export default function ServiceCardsSection() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">
            Expert fabric care designed for every laundry need
          </h2>
          <p className="text-gray-500 text-lg font-medium">
            Carefully handpicked by our experts
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badge */}
                <div
                  className={`absolute top-3 left-3 ${service.badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full`}
                >
                  {service.badge}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Price */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black text-gray-900">
                    {service.price}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    {service.unit}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {service.name}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* CTA */}
                <Link
                  href="/contactus"
                  className="w-full block text-center bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
