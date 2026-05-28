import Image from "next/image";

const features = [
  {
    icon: "fa-solid fa-star",
    title: "Premium Fabric Care",
    description:
      "We use advanced cleaning technology and premium detergents to provide deep cleaning and expert care for every fabric.",
    image: "/images/hero_laundry.png",
    bgColor: "bg-blue-50",
    iconColor: "text-primary-500",
  },
  {
    icon: "fa-solid fa-truck",
    title: "Free Pickup & Doorstep Delivery",
    description:
      "Enjoy hassle-free pickup and fast doorstep delivery service designed for your convenience.",
    image: "/images/delivery_service.png",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "Fast & Hygienic Service",
    description:
      "Experience safe cleaning, express processing, and hygienic garment care with every order.",
    image: "/images/dry_cleaning.png",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
];

export default function FeatureCardsSection() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">
            Your Journey Begins Here
          </h2>
          <p className="text-gray-600 text-lg">
            We make every moment count with solutions designed just for you.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`${feature.bgColor} rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className={`w-10 h-10 rounded-xl ${feature.bgColor} flex items-center justify-center mb-3 border border-white shadow-sm`}>
                  <i className={`${feature.icon} ${feature.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
