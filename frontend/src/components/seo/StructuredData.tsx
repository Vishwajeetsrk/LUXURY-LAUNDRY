export default function StructuredData() {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "LUXURY LAUNDRY",
    alternateName: "LuxWash Premium Laundry",
    description:
      "Premium laundry and dry cleaning services with free doorstep pickup and delivery in Jaipur, Rajasthan.",
    url: "https://luxurylaundryjaipur.com",
    telephone: "+91-9663574728",
    email: "support@luxwash.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Shop No. 504, Bagrota, Ajmer Road",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      postalCode: "302020",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 26.9124,
      longitude: 75.7873,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "10:00",
        closes: "20:00",
      },
    ],
    priceRange: "₹₹",
    image: "https://luxurylaundryjaipur.com/logo.png",
    sameAs: [],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Laundry Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Wash & Fold",
            description: "Fresh washing with premium detergents and neat folding at ₹145/kg",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Wash & Steam Iron",
            description: "Complete wash with professional steam ironing at ₹165/kg",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Dry Cleaning",
            description: "Professional dry cleaning for delicate and premium fabrics",
          },
        },
      ],
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LUXURY LAUNDRY",
    url: "https://luxurylaundryjaipur.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://luxurylaundryjaipur.com/shop?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
