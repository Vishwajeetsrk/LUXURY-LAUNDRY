"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../../context/CartContext";

const products = [
  {
    id: "wash-fold-5kg",
    name: "Wash & Fold — 5kg Pack",
    price: 550,
    originalPrice: 650,
    image: "/images/wash_fold.png",
    badge: "Best Seller",
    badgeColor: "bg-green-500",
    rating: 4.8,
    reviews: 324,
    description: "5kg of everyday clothes — washed, dried & neatly folded.",
  },
  {
    id: "wash-iron-5kg",
    name: "Wash & Steam Iron — 5kg Pack",
    price: 825,
    originalPrice: 950,
    image: "/images/steam_iron.png",
    badge: "Premium",
    badgeColor: "bg-primary-500",
    rating: 4.9,
    reviews: 218,
    description: "5kg deep wash + crisp steam ironing for a perfect finish.",
  },
  {
    id: "dry-clean-suit",
    name: "Suit Dry Cleaning",
    price: 499,
    originalPrice: 599,
    image: "/images/dry_cleaning.png",
    badge: "Luxury",
    badgeColor: "bg-purple-600",
    rating: 4.9,
    reviews: 156,
    description: "Professional dry cleaning for one suit (blazer + trousers).",
  },
  {
    id: "dry-clean-saree",
    name: "Saree Dry Cleaning",
    price: 350,
    originalPrice: 450,
    image: "/images/dry_cleaning.png",
    badge: null,
    badgeColor: "",
    rating: 4.7,
    reviews: 198,
    description: "Expert silk & designer saree dry cleaning with fabric care.",
  },
  {
    id: "shoe-spa-basic",
    name: "Shoe Spa — Basic",
    price: 149,
    originalPrice: 199,
    image: "/images/hero_laundry.png",
    badge: "New",
    badgeColor: "bg-orange-500",
    rating: 4.6,
    reviews: 89,
    description: "Deep clean, deodorize, and polish for any pair of shoes.",
  },
  {
    id: "home-bedsheet",
    name: "Bedsheet Wash Pack",
    price: 299,
    originalPrice: 399,
    image: "/images/wash_fold.png",
    badge: null,
    badgeColor: "",
    rating: 4.5,
    reviews: 112,
    description: "2 double bedsheets — washed, ironed & neatly packed.",
  },
];

export default function ShopPage() {
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // Try shop-products first, fall back to services
    fetch(`${API}/api/shop-products`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0) {
          // Shop products from admin
          const mapped = list.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice || null,
            image: p.image || "/images/wash_fold.png",
            badge: p.badge || null,
            badgeColor: p.badgeColor || "bg-green-500",
            rating: 4.8 + (Math.random() * 0.2),
            reviews: Math.floor(Math.random() * 300) + 50,
            description: p.description || "Premium laundry service",
            unit: p.unit || "pack",
          }));
          setDbServices(mapped);
          setLoading(false);
        } else {
          // Fallback to services
          return fetch(`${API}/api/services`)
            .then(res => res.json())
            .then(sData => {
              const sList = Array.isArray(sData) ? sData : sData.data || [];
              const mappedProducts = sList.map((s: any, idx: number) => ({
                id: s.id,
                name: s.name,
                price: s.pricePerUnit,
                originalPrice: s.pricePerUnit * 1.2,
                image: s.imageUrl || "/images/wash_fold.png",
                badge: idx === 0 ? "Best Seller" : idx === 1 ? "Premium" : null,
                badgeColor: idx === 0 ? "bg-green-500" : "bg-primary-500",
                rating: 4.8 + (Math.random() * 0.2),
                reviews: Math.floor(Math.random() * 300) + 50,
                description: s.description || "Premium laundry service",
                unit: s.unit,
              }));
              setDbServices(mappedProducts);
              setLoading(false);
            });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    // 1. Filter
    const result = dbServices.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. Sort
    result.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      // popularity -> sort by reviews desc
      return b.reviews - a.reviews;
    });

    return result;
  }, [searchQuery, sortBy, dbServices]);

  return (
    <>
      {/* Page Hero */}
      <section className="relative h-48 flex items-center bg-gray-800"
        style={{
          backgroundImage: "url('/images/steam_iron.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black text-white">Shop</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <i className="fa-solid fa-chevron-right text-xs" />
            <span className="text-white">Shop</span>
          </div>
        </div>
      </section>

      {/* Shop Grid */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter & Search bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Our Services</h2>
              <p className="text-gray-500 text-sm mt-1">Showing {filteredAndSortedProducts.length} service packs</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input 
                  type="text" 
                  placeholder="Search services..." 
                  className="form-input pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="form-input py-2 text-sm w-full sm:w-48" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popularity">Sort by: Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <i className="fa-solid fa-box-open text-4xl text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-900">No services found</h3>
                <p className="text-gray-500">Try adjusting your search query.</p>
              </div>
            ) : filteredAndSortedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.badge && (
                    <div className={`absolute top-3 left-3 ${product.badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                      {product.badge}
                    </div>
                  )}
                  {/* Discount */}
                  {product.originalPrice > product.price && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fa-solid fa-star text-xs ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900">
                        ₹{product.price}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart({
                        serviceId: product.id,
                        name: product.name,
                        pricePerUnit: product.price,
                        unit: product.unit || "pack/piece"
                      })}
                      className="bg-primary-500 hover:bg-primary-600 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-cart-plus text-xs" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
