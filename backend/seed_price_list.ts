import dotenv from "dotenv";
dotenv.config();

import prisma from "./src/lib/prisma";

const priceCategories = [
  {
    category: "MEN'S WEAR",
    items: [
      { name: "Shirt/T-Shirt", image: "/images/items/shirt.png", dryCleanPrice: "200/200", steamIronPrice: "20/20" },
      { name: "Trouser/Jeans", image: "/images/items/trouser.png", dryCleanPrice: "200/210", steamIronPrice: "20/30" },
      { name: "Coat", image: "/images/items/coat.png", dryCleanPrice: "350", steamIronPrice: "60" },
      { name: "Mens Suit 2/3 pcs", image: "/images/items/coat.png", dryCleanPrice: "450/550", steamIronPrice: "80/100" },
      { name: "Kurta/Pyjama", image: "/images/items/shirt.png", dryCleanPrice: "220+/200+", steamIronPrice: "30+/20+" },
      { name: "Achkan", image: "/images/items/coat.png", dryCleanPrice: "600", steamIronPrice: "120" },
    ]
  },
  {
    category: "WOMEN'S WEAR",
    items: [
      { name: "Kurta", image: "/images/items/dress.png", dryCleanPrice: "220+", steamIronPrice: "30+" },
      { name: "Salwar/Plazo", image: "/images/items/dress.png", dryCleanPrice: "200/200+", steamIronPrice: "20/20+" },
      { name: "Dupatta", image: "/images/items/dress.png", dryCleanPrice: "170+", steamIronPrice: "20+" },
      { name: "Saree/Blouse", image: "/images/items/dress.png", dryCleanPrice: "375+/210+", steamIronPrice: "70+/30+" },
      { name: "Dress", image: "/images/items/dress.png", dryCleanPrice: "400+", steamIronPrice: "70+" },
      { name: "Top", image: "/images/items/shirt.png", dryCleanPrice: "220+", steamIronPrice: "30+" },
      { name: "Lehenga", image: "/images/items/dress.png", dryCleanPrice: "650+", steamIronPrice: "130+" },
      { name: "Skirt", image: "/images/items/dress.png", dryCleanPrice: "310+", steamIronPrice: "50+" },
    ]
  },
  {
    category: "WOOLEN",
    items: [
      { name: "Jacket F/H Sleeves", image: "/images/items/coat.png", dryCleanPrice: "375+/310", steamIronPrice: "70+/50" },
      { name: "Sweater F/H Sleeves", image: "/images/items/sweater.png", dryCleanPrice: "280+/240", steamIronPrice: "40+/30" },
      { name: "Sweat Shirt", image: "/images/items/sweater.png", dryCleanPrice: "330", steamIronPrice: "60" },
      { name: "Long Coat", image: "/images/items/coat.png", dryCleanPrice: "480", steamIronPrice: "90" },
      { name: "Shawl/Pashmina", image: "/images/items/blanket.png", dryCleanPrice: "280+/610", steamIronPrice: "40+/120" },
      { name: "Leather Jacket", image: "/images/items/coat.png", dryCleanPrice: "600", steamIronPrice: "120" },
    ]
  },
  {
    category: "HOUSEHOLD ITEMS",
    items: [
      { name: "Blanket Single 1/2 Ply", image: "/images/items/blanket.png", dryCleanPrice: "450/540", steamIronPrice: null },
      { name: "Blanket Double 1/2 Ply", image: "/images/items/blanket.png", dryCleanPrice: "550/660", steamIronPrice: null },
      { name: "Quilt Single/Double", image: "/images/items/blanket.png", dryCleanPrice: "450/550", steamIronPrice: null },
      { name: "Duvet", image: "/images/items/blanket.png", dryCleanPrice: "180+", steamIronPrice: null },
      { name: "Curtain Door/Window (Without Lining)", image: "/images/items/curtain.png", dryCleanPrice: "265+", steamIronPrice: null },
      { name: "Curtain Door/Window (With Lining)", image: "/images/items/curtain.png", dryCleanPrice: "390+", steamIronPrice: null },
      { name: "Bed Sheet Single/Double", image: "/images/items/blanket.png", dryCleanPrice: "220/300", steamIronPrice: null },
      { name: "Carpet", image: "/images/items/blanket.png", dryCleanPrice: "145/Sq Ft", steamIronPrice: null },
      { name: "Blind", image: "/images/items/curtain.png", dryCleanPrice: "320+", steamIronPrice: null },
    ]
  },
  {
    category: "SHOES",
    items: [
      { name: "Sports", image: "/images/items/shoes.png", dryCleanPrice: "450", steamIronPrice: null },
      { name: "Canvas/Sneaker (Non Leather)", image: "/images/items/shoes.png", dryCleanPrice: "450", steamIronPrice: null },
      { name: "Leather", image: "/images/items/shoes.png", dryCleanPrice: "550", steamIronPrice: null },
      { name: "Suede Leather", image: "/images/items/shoes.png", dryCleanPrice: "650", steamIronPrice: null },
      { name: "Boots", image: "/images/items/shoes.png", dryCleanPrice: "740+", steamIronPrice: null },
    ]
  },
  {
    category: "BAGS",
    items: [
      { name: "Handbag", image: "/images/items/bag.png", dryCleanPrice: "600+", steamIronPrice: null },
      { name: "Canvass/Jute/Cloth", image: "/images/items/bag.png", dryCleanPrice: "450+", steamIronPrice: null },
      { name: "Handbag Leather", image: "/images/items/bag.png", dryCleanPrice: "850+", steamIronPrice: null },
      { name: "Suit Case", image: "/images/items/bag.png", dryCleanPrice: "350+", steamIronPrice: null },
      { name: "Wallet", image: "/images/items/bag.png", dryCleanPrice: "350+", steamIronPrice: null },
    ]
  },
  {
    category: "LAUNDRY",
    items: [
      { name: "5 Garments Approx /Kg", image: "/images/items/laundry_basket.png", dryCleanPrice: "—", steamIronPrice: null },
      { name: "Wash & Steam Iron", image: "/images/items/laundry_basket.png", price: "135/Kg", steamIronPrice: null },
      { name: "Wash & Fold", image: "/images/items/laundry_basket.png", price: "85/Kg", steamIronPrice: null },
    ]
  }
];

async function main() {
  console.log("Seeding price list items...");
  
  await prisma.priceListItem.deleteMany({});
  
  let sortOrder = 1;
  for (const cat of priceCategories) {
    for (const item of cat.items) {
      await prisma.priceListItem.create({
        data: {
          category: cat.category,
          name: item.name,
          image: item.image,
          dryCleanPrice: item.dryCleanPrice || null,
          steamIronPrice: item.steamIronPrice || null,
          price: (item as any).price || null,
          sortOrder: sortOrder++,
          isActive: true
        }
      });
    }
  }
  
  console.log("Seeding completed successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
