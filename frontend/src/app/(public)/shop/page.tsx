"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../../context/CartContext";
import { Skeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";

const products = [
  {
    id: "wash-fold-5kg",
    name: "Wash & Fold — 5kg Pack",
    price: 550,
    originalPrice: 663,
    image: "/images/wash_fold.png",
    badge: "17% OFF",
    badgeColor: "bg-red-500",
    rating: 4.8,
    reviews: 324,
    description: "5kg of everyday clothes — washed, dried & neatly folded.",
  },
  {
    id: "wash-iron-5kg",
    name: "Wash & Steam Iron — 5kg Pack",
    price: 825,
    originalPrice: 994,
    image: "/images/steam_iron.png",
    badge: "17% OFF",
    badgeColor: "bg-red-500",
    rating: 4.9,
    reviews: 218,
    description: "5kg deep wash + crisp steam ironing for a perfect finish.",
  },
  {
    id: "dry-clean-suit",
    name: "Suit Dry Cleaning",
    price: 499,
    originalPrice: 601,
    image: "/images/dry_cleaning.png",
    badge: "17% OFF",
    badgeColor: "bg-red-500",
    rating: 4.9,
    reviews: 156,
    description: "Professional dry cleaning for one suit (blazer + trousers).",
  },
  {
    id: "dry-clean-saree",
    name: "Saree Dry Cleaning",
    price: 350,
    originalPrice: 422,
    image: "/images/dry_cleaning.png",
    badge: "17% OFF",
    badgeColor: "bg-red-500",
    rating: 4.7,
    reviews: 198,
    description: "Expert silk & designer saree dry cleaning with fabric care.",
  },
  {
    id: "shoe-spa-basic",
    name: "Shoe Spa — Basic",
    price: 149,
    originalPrice: 180,
    image: "/images/hero_laundry.png",
    badge: "17% OFF",
    badgeColor: "bg-red-500",
    rating: 4.6,
    reviews: 89,
    description: "Deep clean, deodorize, and polish for any pair of shoes.",
  },
  {
    id: "home-bedsheet",
    name: "Bedsheet Wash Pack",
    price: 299,
    originalPrice: 360,
    image: "/images/wash_fold.png",
    badge: "17% OFF",
    badgeColor: "bg-red-500",
    rating: 4.5,
    reviews: 112,
    description: "2 double bedsheets — washed, ironed & neatly packed.",
  },
];

function getDiscountPercentage(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 10 + (Math.abs(hash) % 31); // 10% to 40%
}

function getImageForService(name: string) {
  const n = name.toLowerCase();
  if (n.includes("shoe") || n.includes("sneaker") || n.includes("boot") || n.includes("canvas")) return "/images/shoes.png";
  if (n.includes("bag") || n.includes("wallet") || n.includes("case") || n.includes("handbag")) return "/images/bag.png";
  if (n.includes("blanket") || n.includes("quilt") || n.includes("duvet") || n.includes("bed sheet")) return "/images/blanket.png";
  if (n.includes("curtain") || n.includes("blind") || n.includes("carpet")) return "/images/curtain.png";
  if (n.includes("saree") || n.includes("lehenga") || n.includes("salwar") || n.includes("dress") || n.includes("skirt") || n.includes("plazo") || n.includes("dupatta") || n.includes("blouse") || n.includes("top")) return "/images/dress.png";
  if (n.includes("sweater") || n.includes("jacket") || n.includes("pashmina") || n.includes("shawl") || n.includes("sweat shirt")) return "/images/sweater.png";
  if (n.includes("suit") && !n.includes("case")) return "/images/coat.png";
  if (n.includes("coat") || n.includes("achkan")) return "/images/coat.png";
  if (n.includes("trouser") || n.includes("jeans") || n.includes("pyjama")) return "/images/trouser.png";
  if (n.includes("shirt") || n.includes("kurta") || n.includes("t-shirt")) return "/images/shirt.png";
  if (n.includes("dry clean")) return "/images/dry_cleaning.png";
  if (n.includes("iron")) return "/images/steam_iron.png";
  return "/images/wash_fold.png";
}

export default function ShopPage() {
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        // 1) Try shop-products first
        const shopRes = await fetch(`${API}/api/shop-products`);
        if (!shopRes.ok) throw new Error(`shop-products failed: ${shopRes.status}`);

        const shopData = await shopRes.json();
        const shopList = Array.isArray(shopData) ? shopData : [];

        if (shopList.length > 0) {
          const mapped = shopList.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice || null,
            image: p.image || "/images/wash_fold.png",
            badge: p.badge || null,
            badgeColor: p.badgeColor || "bg-green-500",
            rating: 4.8 + Math.random() * 0.2,
            reviews: Math.floor(Math.random() * 300) + 50,
            description: p.description || "Premium laundry service",
            unit: p.unit || "pack",
          }));

          if (!cancelled) setDbServices(mapped);
          return;
        }

        // 2) Fallback to active services
        const servicesRes = await fetch(`${API}/api/services`);
        if (!servicesRes.ok) throw new Error(`services failed: ${servicesRes.status}`);

        const sData = await servicesRes.json();
        const sList = Array.isArray(sData) ? sData : sData.data || [];

        const activeServices = sList.filter((s: any) => s.isActive !== false);

        const mappedProducts = activeServices.map((s: any, idx: number) => {
          let origPrice = s.originalPrice;
          
          if (!origPrice) {
            const discountPercent = getDiscountPercentage(s.name);
            origPrice = Math.round(s.pricePerUnit / (1 - discountPercent / 100));
          }

          return {
            id: s.id,
            name: s.name,
            price: s.pricePerUnit,
            originalPrice: origPrice,
            image: s.imageUrl || getImageForService(s.name),
            badge: idx === 0 ? "Best Seller" : idx === 1 ? "Premium" : null,
            badgeColor: idx === 0 ? "bg-green-500" : "bg-primary-500",
            rating: 4.8 + Math.random() * 0.2,
            reviews: Math.floor(Math.random() * 300) + 50,
            description: s.description || `${s.category || "Premium"} service`,
            unit: s.unit,
          };
        });

        if (!cancelled) setDbServices(mappedProducts);
      } catch (e) {
        console.error("Shop load error:", e);
        if (!cancelled) setDbServices(products);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
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
            {loading ? (
              // Loading Skeletons
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <Skeleton className="w-full h-52 rounded-none" />
                  <div className="p-5">
                    <Skeleton className="w-16 h-3 mb-3" />
                    <Skeleton className="w-3/4 h-5 mb-3" />
                    <Skeleton className="w-full h-4 mb-2" />
                    <Skeleton className="w-5/6 h-4 mb-5" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="w-20 h-6" />
                      <Skeleton className="w-20 h-10 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="col-span-full">
                <EmptyState 
                  icon="fa-box-open" 
                  title="No services found" 
                  description="We couldn't find any services matching your search criteria. Try adjusting your search query."
                />
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
                      {[1, 2, 3, 4, 5].map((star) => {
                        const full = product.rating >= star;
                        const half = !full && product.rating >= star - 0.5;
                        return (
                          <i
                            key={star}
                            className={`fa-solid ${half ? 'fa-star-half-stroke' : 'fa-star'} text-xs ${
                              full || half ? 'text-yellow-400' : 'text-gray-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-xs text-gray-500">
                      {product.rating.toFixed(1)} ({product.reviews})
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
                        unit: product.unit || "pack/piece",
                        image: product.image
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
