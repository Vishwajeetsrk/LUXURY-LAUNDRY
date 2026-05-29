import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Using connection string from process.env.DATABASE_URL
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Fetching shop products...");
  const products = await prisma.shopProduct.findMany();
  console.log(`Found ${products.length} products`);

  for (const product of products) {
    const discount = 0.15 + (Math.random() * 0.07);
    const originalPrice = Math.round(product.price / (1 - discount));
    
    const discountPercent = Math.round((1 - (product.price / originalPrice)) * 100);
    const badge = `${discountPercent}% OFF`;
    const badgeColor = "bg-red-500";

    await prisma.shopProduct.update({
      where: { id: product.id },
      data: {
        originalPrice,
        badge,
        badgeColor
      }
    });
    console.log(`Updated ${product.name}: price=${product.price}, original=${originalPrice}, badge=${badge}`);
  }
  
  console.log("Done updating shop products.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
