import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Updating services from new price list...\n");

  // Disable all existing services first so we start clean
  await prisma.service.updateMany({
    data: { isActive: false },
  });

  const servicesData = [
    // MEN'S WEAR
    { id: "mens-shirt-dc", name: "Shirt (Dry Clean)", category: "Men's Wear", pricePerUnit: 200, unit: "piece" },
    { id: "mens-shirt-si", name: "Shirt (Steam Iron)", category: "Men's Wear", pricePerUnit: 20, unit: "piece" },
    { id: "mens-tshirt-dc", name: "T-Shirt (Dry Clean)", category: "Men's Wear", pricePerUnit: 200, unit: "piece" },
    { id: "mens-tshirt-si", name: "T-Shirt (Steam Iron)", category: "Men's Wear", pricePerUnit: 20, unit: "piece" },
    { id: "mens-trouser-dc", name: "Trouser (Dry Clean)", category: "Men's Wear", pricePerUnit: 200, unit: "piece" },
    { id: "mens-trouser-si", name: "Trouser (Steam Iron)", category: "Men's Wear", pricePerUnit: 20, unit: "piece" },
    { id: "mens-jeans-dc", name: "Jeans (Dry Clean)", category: "Men's Wear", pricePerUnit: 210, unit: "piece" },
    { id: "mens-jeans-si", name: "Jeans (Steam Iron)", category: "Men's Wear", pricePerUnit: 30, unit: "piece" },
    { id: "mens-coat-dc", name: "Coat (Dry Clean)", category: "Men's Wear", pricePerUnit: 350, unit: "piece" },
    { id: "mens-coat-si", name: "Coat (Steam Iron)", category: "Men's Wear", pricePerUnit: 60, unit: "piece" },
    { id: "mens-suit-2pc-dc", name: "Mens Suit 2 pcs (Dry Clean)", category: "Men's Wear", pricePerUnit: 450, unit: "piece" },
    { id: "mens-suit-2pc-si", name: "Mens Suit 2 pcs (Steam Iron)", category: "Men's Wear", pricePerUnit: 80, unit: "piece" },
    { id: "mens-suit-3pc-dc", name: "Mens Suit 3 pcs (Dry Clean)", category: "Men's Wear", pricePerUnit: 550, unit: "piece" },
    { id: "mens-suit-3pc-si", name: "Mens Suit 3 pcs (Steam Iron)", category: "Men's Wear", pricePerUnit: 100, unit: "piece" },
    { id: "mens-kurta-dc", name: "Kurta (Men's) (Dry Clean)", category: "Men's Wear", pricePerUnit: 220, unit: "piece" },
    { id: "mens-kurta-si", name: "Kurta (Men's) (Steam Iron)", category: "Men's Wear", pricePerUnit: 30, unit: "piece" },
    { id: "mens-pyjama-dc", name: "Pyjama (Dry Clean)", category: "Men's Wear", pricePerUnit: 200, unit: "piece" },
    { id: "mens-pyjama-si", name: "Pyjama (Steam Iron)", category: "Men's Wear", pricePerUnit: 20, unit: "piece" },
    { id: "mens-achkan-dc", name: "Achkan (Dry Clean)", category: "Men's Wear", pricePerUnit: 600, unit: "piece" },
    { id: "mens-achkan-si", name: "Achkan (Steam Iron)", category: "Men's Wear", pricePerUnit: 120, unit: "piece" },

    // WOMEN'S WEAR
    { id: "womens-kurta-dc", name: "Kurta (Women's) (Dry Clean)", category: "Women's Wear", pricePerUnit: 220, unit: "piece" },
    { id: "womens-kurta-si", name: "Kurta (Women's) (Steam Iron)", category: "Women's Wear", pricePerUnit: 30, unit: "piece" },
    { id: "womens-salwar-dc", name: "Salwar (Dry Clean)", category: "Women's Wear", pricePerUnit: 200, unit: "piece" },
    { id: "womens-salwar-si", name: "Salwar (Steam Iron)", category: "Women's Wear", pricePerUnit: 20, unit: "piece" },
    { id: "womens-plazo-dc", name: "Plazo (Dry Clean)", category: "Women's Wear", pricePerUnit: 200, unit: "piece" },
    { id: "womens-plazo-si", name: "Plazo (Steam Iron)", category: "Women's Wear", pricePerUnit: 20, unit: "piece" },
    { id: "womens-dupatta-dc", name: "Dupatta (Dry Clean)", category: "Women's Wear", pricePerUnit: 170, unit: "piece" },
    { id: "womens-dupatta-si", name: "Dupatta (Steam Iron)", category: "Women's Wear", pricePerUnit: 20, unit: "piece" },
    { id: "womens-saree-dc", name: "Saree (Dry Clean)", category: "Women's Wear", pricePerUnit: 375, unit: "piece" },
    { id: "womens-saree-si", name: "Saree (Steam Iron)", category: "Women's Wear", pricePerUnit: 70, unit: "piece" },
    { id: "womens-blouse-dc", name: "Blouse (Dry Clean)", category: "Women's Wear", pricePerUnit: 210, unit: "piece" },
    { id: "womens-blouse-si", name: "Blouse (Steam Iron)", category: "Women's Wear", pricePerUnit: 30, unit: "piece" },
    { id: "womens-dress-dc", name: "Dress (Dry Clean)", category: "Women's Wear", pricePerUnit: 400, unit: "piece" },
    { id: "womens-dress-si", name: "Dress (Steam Iron)", category: "Women's Wear", pricePerUnit: 70, unit: "piece" },
    { id: "womens-top-dc", name: "Top (Dry Clean)", category: "Women's Wear", pricePerUnit: 220, unit: "piece" },
    { id: "womens-top-si", name: "Top (Steam Iron)", category: "Women's Wear", pricePerUnit: 30, unit: "piece" },
    { id: "womens-lehenga-dc", name: "Lehenga (Dry Clean)", category: "Women's Wear", pricePerUnit: 650, unit: "piece" },
    { id: "womens-lehenga-si", name: "Lehenga (Steam Iron)", category: "Women's Wear", pricePerUnit: 130, unit: "piece" },
    { id: "womens-skirt-dc", name: "Skirt (Dry Clean)", category: "Women's Wear", pricePerUnit: 310, unit: "piece" },
    { id: "womens-skirt-si", name: "Skirt (Steam Iron)", category: "Women's Wear", pricePerUnit: 50, unit: "piece" },

    // WOOLEN
    { id: "woolen-jacket-fs-dc", name: "Jacket F Sleeves (Dry Clean)", category: "Woolen", pricePerUnit: 375, unit: "piece" },
    { id: "woolen-jacket-fs-si", name: "Jacket F Sleeves (Steam Iron)", category: "Woolen", pricePerUnit: 70, unit: "piece" },
    { id: "woolen-jacket-hs-dc", name: "Jacket H Sleeves (Dry Clean)", category: "Woolen", pricePerUnit: 310, unit: "piece" },
    { id: "woolen-jacket-hs-si", name: "Jacket H Sleeves (Steam Iron)", category: "Woolen", pricePerUnit: 50, unit: "piece" },
    { id: "woolen-sweater-fs-dc", name: "Sweater F Sleeves (Dry Clean)", category: "Woolen", pricePerUnit: 280, unit: "piece" },
    { id: "woolen-sweater-fs-si", name: "Sweater F Sleeves (Steam Iron)", category: "Woolen", pricePerUnit: 40, unit: "piece" },
    { id: "woolen-sweater-hs-dc", name: "Sweater H Sleeves (Dry Clean)", category: "Woolen", pricePerUnit: 240, unit: "piece" },
    { id: "woolen-sweater-hs-si", name: "Sweater H Sleeves (Steam Iron)", category: "Woolen", pricePerUnit: 30, unit: "piece" },
    { id: "woolen-sweatshirt-dc", name: "Sweat Shirt (Dry Clean)", category: "Woolen", pricePerUnit: 330, unit: "piece" },
    { id: "woolen-sweatshirt-si", name: "Sweat Shirt (Steam Iron)", category: "Woolen", pricePerUnit: 60, unit: "piece" },
    { id: "woolen-longcoat-dc", name: "Long Coat (Dry Clean)", category: "Woolen", pricePerUnit: 480, unit: "piece" },
    { id: "woolen-longcoat-si", name: "Long Coat (Steam Iron)", category: "Woolen", pricePerUnit: 90, unit: "piece" },
    { id: "woolen-shawl-dc", name: "Shawl (Dry Clean)", category: "Woolen", pricePerUnit: 280, unit: "piece" },
    { id: "woolen-shawl-si", name: "Shawl (Steam Iron)", category: "Woolen", pricePerUnit: 40, unit: "piece" },
    { id: "woolen-pashmina-dc", name: "Pashmina (Dry Clean)", category: "Woolen", pricePerUnit: 610, unit: "piece" },
    { id: "woolen-pashmina-si", name: "Pashmina (Steam Iron)", category: "Woolen", pricePerUnit: 120, unit: "piece" },
    { id: "woolen-leather-jacket-dc", name: "Leather Jacket (Dry Clean)", category: "Woolen", pricePerUnit: 600, unit: "piece" },
    { id: "woolen-leather-jacket-si", name: "Leather Jacket (Steam Iron)", category: "Woolen", pricePerUnit: 120, unit: "piece" },

    // HOUSEHOLD ITEMS
    { id: "hh-blanket-single-1ply", name: "Blanket Single 1 Ply", category: "Household", pricePerUnit: 450, unit: "piece" },
    { id: "hh-blanket-single-2ply", name: "Blanket Single 2 Ply", category: "Household", pricePerUnit: 540, unit: "piece" },
    { id: "hh-blanket-double-1ply", name: "Blanket Double 1 Ply", category: "Household", pricePerUnit: 550, unit: "piece" },
    { id: "hh-blanket-double-2ply", name: "Blanket Double 2 Ply", category: "Household", pricePerUnit: 660, unit: "piece" },
    { id: "hh-quilt-single", name: "Quilt Single", category: "Household", pricePerUnit: 450, unit: "piece" },
    { id: "hh-quilt-double", name: "Quilt Double", category: "Household", pricePerUnit: 550, unit: "piece" },
    { id: "hh-duvet", name: "Duvet", category: "Household", pricePerUnit: 180, unit: "piece" },
    { id: "hh-curtain-no-lining", name: "Curtain (Without Lining)", category: "Household", pricePerUnit: 265, unit: "piece" },
    { id: "hh-curtain-lining", name: "Curtain (With Lining)", category: "Household", pricePerUnit: 390, unit: "piece" },
    { id: "hh-bedsheet-single", name: "Bed Sheet Single", category: "Household", pricePerUnit: 220, unit: "piece" },
    { id: "hh-bedsheet-double", name: "Bed Sheet Double", category: "Household", pricePerUnit: 300, unit: "piece" },
    { id: "hh-carpet", name: "Carpet", category: "Household", pricePerUnit: 145, unit: "sqft" },
    { id: "hh-blind", name: "Blind", category: "Household", pricePerUnit: 320, unit: "piece" },

    // SHOES
    { id: "shoes-sports", name: "Sports Shoes", category: "Shoes", pricePerUnit: 450, unit: "pair" },
    { id: "shoes-canvas", name: "Canvas/Sneaker (Non Leather)", category: "Shoes", pricePerUnit: 450, unit: "pair" },
    { id: "shoes-leather", name: "Leather Shoes", category: "Shoes", pricePerUnit: 550, unit: "pair" },
    { id: "shoes-suede", name: "Suede Leather Shoes", category: "Shoes", pricePerUnit: 650, unit: "pair" },
    { id: "shoes-boots", name: "Boots", category: "Shoes", pricePerUnit: 740, unit: "pair" },

    // BAGS
    { id: "bags-handbag", name: "Handbag", category: "Bags", pricePerUnit: 600, unit: "piece" },
    { id: "bags-canvas-jute", name: "Canvass/Jute/Cloth Bag", category: "Bags", pricePerUnit: 450, unit: "piece" },
    { id: "bags-handbag-leather", name: "Handbag Leather", category: "Bags", pricePerUnit: 850, unit: "piece" },
    { id: "bags-suitcase", name: "Suit Case", category: "Bags", pricePerUnit: 350, unit: "piece" },
    { id: "bags-wallet", name: "Wallet", category: "Bags", pricePerUnit: 350, unit: "piece" },

    // LAUNDRY
    { id: "laundry-wash-steam-iron", name: "Wash & Steam Iron", category: "Laundry", pricePerUnit: 135, unit: "kg" },
    { id: "laundry-wash-fold", name: "Wash & Fold", category: "Laundry", pricePerUnit: 85, unit: "kg" },
  ];

  let count = 0;
  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        pricePerUnit: s.pricePerUnit,
        unit: s.unit,
        description: s.category + " service",
        isActive: true, // re-enable it
      },
      create: {
        id: s.id,
        name: s.name,
        pricePerUnit: s.pricePerUnit,
        unit: s.unit,
        description: s.category + " service",
        isActive: true,
      },
    });
    count++;
  }

  console.log(`✅ Upserted ${count} services successfully!`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
