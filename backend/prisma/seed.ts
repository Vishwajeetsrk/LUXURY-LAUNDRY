import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // 1. Create the owner account. Only this account starts as SUPER_ADMIN.
  const ownerEmail = process.env.OWNER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@luxwash.com";
  const ownerPassword = process.env.OWNER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "Admin@12345";
  const ownerPasswordHash = await bcrypt.hash(ownerPassword, 10);
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { password: ownerPasswordHash, role: "SUPER_ADMIN", name: "Vishwajeet" },
    create: {
      name: "Vishwajeet",
      email: ownerEmail,
      password: ownerPasswordHash,
      phone: "+919663574728",
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Owner SUPER_ADMIN ready:", owner.email);

  // 2. Create Sample Customer
  const custPassword = await bcrypt.hash("Customer@123", 10);
  const customer = await prisma.user.upsert({
    where: { email: "rahul@example.com" },
    update: { password: custPassword, role: "CUSTOMER" },
    create: {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      password: custPassword,
      phone: "+919876543210",
      role: "CUSTOMER",
    },
  });
  console.log("✅ Sample customer created:", customer.email);

  if (process.env.SEED_DEMO_PANEL_USERS === "true") {
  // 2b. Super Admin
  const superPassword = await bcrypt.hash("SuperAdmin@123", 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@luxwash.com" },
    update: { password: superPassword, role: "SUPER_ADMIN" },
    create: {
      name: "Super Admin",
      email: "superadmin@luxwash.com",
      password: superPassword,
      phone: "+919663574728",
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Super Admin created:", superAdmin.email);

  // 2c. Staff
  const staffPassword = await bcrypt.hash("Staff@12345", 10);
  const staff = await prisma.user.upsert({
    where: { email: "staff@luxwash.com" },
    update: { password: staffPassword, role: "STAFF" },
    create: {
      name: "Shop Staff",
      email: "staff@luxwash.com",
      password: staffPassword,
      phone: "+919663574729",
      role: "STAFF",
    },
  });
  console.log("✅ Staff user created:", staff.email);

  // 2d. Delivery
  const deliveryPassword = await bcrypt.hash("Delivery@123", 10);
  const delivery = await prisma.user.upsert({
    where: { email: "delivery@luxwash.com" },
    update: { password: deliveryPassword, role: "DELIVERY" },
    create: {
      name: "Delivery Partner",
      email: "delivery@luxwash.com",
      password: deliveryPassword,
      phone: "+919663574730",
      role: "DELIVERY",
    },
  });
  console.log("✅ Delivery user created:", delivery.email);

  }

  // 3. Create Services
  const servicesData = [
    { id: "laundry-wash-fold", name: "Wash & Fold", description: "Laundry service billed per kg.", pricePerUnit: 145, unit: "kg" },
    { id: "laundry-wash-steam-iron", name: "Wash & Steam Iron", description: "Laundry with steam ironing billed per kg.", pricePerUnit: 165, unit: "kg" },

    { id: "mens-shirt-dry-clean", name: "Shirt/T-Shirt (Dry Clean)", description: "Men's wear dry clean service.", pricePerUnit: 100, unit: "piece" },
    { id: "mens-shirt-steam-iron", name: "Shirt/T-Shirt (Steam Iron)", description: "Men's wear steam iron service.", pricePerUnit: 20, unit: "piece" },
    { id: "mens-trouser-jeans-dry-clean", name: "Trouser/Jeans (Dry Clean)", description: "Starting price maintained at ₹100.", pricePerUnit: 100, unit: "piece" },
    { id: "mens-trouser-jeans-steam-iron", name: "Trouser/Jeans (Steam Iron)", description: "Men's wear steam iron service.", pricePerUnit: 20, unit: "piece" },
    { id: "mens-coat-dry-clean", name: "Coat (Dry Clean)", description: "Men's coat dry clean service.", pricePerUnit: 250, unit: "piece" },
    { id: "mens-coat-steam-iron", name: "Coat (Steam Iron)", description: "Men's coat steam iron service.", pricePerUnit: 60, unit: "piece" },
    { id: "mens-suit-2pc-dry-clean", name: "Mens Suit 2pc (Dry Clean)", description: "Men's suit two-piece dry clean.", pricePerUnit: 350, unit: "piece" },
    { id: "mens-suit-3pc-dry-clean", name: "Mens Suit 3pc (Dry Clean)", description: "Men's suit three-piece dry clean.", pricePerUnit: 450, unit: "piece" },
    { id: "mens-suit-2pc-steam-iron", name: "Mens Suit 2pc (Steam Iron)", description: "Men's suit two-piece steam iron.", pricePerUnit: 80, unit: "piece" },
    { id: "mens-suit-3pc-steam-iron", name: "Mens Suit 3pc (Steam Iron)", description: "Men's suit three-piece steam iron.", pricePerUnit: 100, unit: "piece" },
    { id: "mens-kurta-pyjama-dry-clean", name: "Kurta/Pyjama (Dry Clean)", description: "Starting from ₹120.", pricePerUnit: 120, unit: "piece" },
    { id: "mens-kurta-pyjama-steam-iron", name: "Kurta/Pyjama (Steam Iron)", description: "Starting from ₹30.", pricePerUnit: 30, unit: "piece" },
    { id: "mens-achkan-dry-clean", name: "Achkan (Dry Clean)", description: "Men's achkan dry clean service.", pricePerUnit: 500, unit: "piece" },
    { id: "mens-achkan-steam-iron", name: "Achkan (Steam Iron)", description: "Men's achkan steam iron service.", pricePerUnit: 120, unit: "piece" },

    { id: "women-kurta-dry-clean", name: "Kurta (Dry Clean)", description: "Starting from ₹120.", pricePerUnit: 120, unit: "piece" },
    { id: "women-kurta-steam-iron", name: "Kurta (Steam Iron)", description: "Starting from ₹30.", pricePerUnit: 30, unit: "piece" },
    { id: "women-salwar-plazo-dry-clean", name: "Salwar/Plazo (Dry Clean)", description: "Women's wear dry clean service.", pricePerUnit: 100, unit: "piece" },
    { id: "women-salwar-plazo-steam-iron", name: "Salwar/Plazo (Steam Iron)", description: "Women's wear steam iron service.", pricePerUnit: 20, unit: "piece" },
    { id: "women-dupatta-dry-clean", name: "Dupatta (Dry Clean)", description: "Starting from ₹70.", pricePerUnit: 70, unit: "piece" },
    { id: "women-dupatta-steam-iron", name: "Dupatta (Steam Iron)", description: "Starting from ₹20.", pricePerUnit: 20, unit: "piece" },
    { id: "women-saree-blouse-dry-clean", name: "Saree/Blouse (Dry Clean)", description: "Starting from ₹275.", pricePerUnit: 275, unit: "piece" },
    { id: "women-saree-blouse-steam-iron", name: "Saree/Blouse (Steam Iron)", description: "Starting from ₹70.", pricePerUnit: 70, unit: "piece" },
    { id: "women-dress-dry-clean", name: "Dress (Dry Clean)", description: "Starting from ₹300.", pricePerUnit: 300, unit: "piece" },
    { id: "women-dress-steam-iron", name: "Dress (Steam Iron)", description: "Starting from ₹70.", pricePerUnit: 70, unit: "piece" },
    { id: "women-top-dry-clean", name: "Top (Dry Clean)", description: "Starting from ₹120.", pricePerUnit: 120, unit: "piece" },
    { id: "women-top-steam-iron", name: "Top (Steam Iron)", description: "Starting from ₹30.", pricePerUnit: 30, unit: "piece" },
    { id: "women-lehenga-dry-clean", name: "Lehenga (Dry Clean)", description: "Starting from ₹550.", pricePerUnit: 550, unit: "piece" },
    { id: "women-lehenga-steam-iron", name: "Lehenga (Steam Iron)", description: "Starting from ₹130.", pricePerUnit: 130, unit: "piece" },
    { id: "women-skirt-dry-clean", name: "Skirt (Dry Clean)", description: "Starting from ₹210.", pricePerUnit: 210, unit: "piece" },
    { id: "women-skirt-steam-iron", name: "Skirt (Steam Iron)", description: "Starting from ₹50.", pricePerUnit: 50, unit: "piece" },

    { id: "woolen-jacket-fh-dry-clean", name: "Jacket F/H Sleeves (Dry Clean)", description: "Woolen jacket dry clean service.", pricePerUnit: 275, unit: "piece" },
    { id: "woolen-jacket-fh-steam-iron", name: "Jacket F/H Sleeves (Steam Iron)", description: "Woolen jacket steam iron service.", pricePerUnit: 70, unit: "piece" },
    { id: "woolen-sweater-fh-dry-clean", name: "Sweater F/H Sleeves (Dry Clean)", description: "Woolen sweater dry clean service.", pricePerUnit: 180, unit: "piece" },
    { id: "woolen-sweater-fh-steam-iron", name: "Sweater F/H Sleeves (Steam Iron)", description: "Woolen sweater steam iron service.", pricePerUnit: 40, unit: "piece" },
    { id: "woolen-sweatshirt-dry-clean", name: "Sweat Shirt (Dry Clean)", description: "Woolen sweatshirt dry clean service.", pricePerUnit: 230, unit: "piece" },
    { id: "woolen-sweatshirt-steam-iron", name: "Sweat Shirt (Steam Iron)", description: "Woolen sweatshirt steam iron service.", pricePerUnit: 60, unit: "piece" },
    { id: "woolen-long-coat-dry-clean", name: "Long Coat (Dry Clean)", description: "Woolen long coat dry clean service.", pricePerUnit: 380, unit: "piece" },
    { id: "woolen-long-coat-steam-iron", name: "Long Coat (Steam Iron)", description: "Woolen long coat steam iron service.", pricePerUnit: 90, unit: "piece" },
    { id: "woolen-shawl-pashmina-dry-clean", name: "Shawl/Pashmina (Dry Clean)", description: "Starting from ₹180.", pricePerUnit: 180, unit: "piece" },
    { id: "woolen-shawl-pashmina-steam-iron", name: "Shawl/Pashmina (Steam Iron)", description: "Starting from ₹40.", pricePerUnit: 40, unit: "piece" },
    { id: "woolen-leather-jacket-dry-clean", name: "Leather Jacket (Dry Clean)", description: "Leather jacket dry clean service.", pricePerUnit: 500, unit: "piece" },
    { id: "woolen-leather-jacket-steam-iron", name: "Leather Jacket (Steam Iron)", description: "Leather jacket steam iron service.", pricePerUnit: 120, unit: "piece" },

    { id: "household-blanket-single-1ply", name: "Blanket Single 1 Ply", description: "Household dry clean.", pricePerUnit: 350, unit: "piece" },
    { id: "household-blanket-single-2ply", name: "Blanket Single 2 Ply", description: "Household dry clean.", pricePerUnit: 440, unit: "piece" },
    { id: "household-blanket-double-1ply", name: "Blanket Double 1 Ply", description: "Household dry clean.", pricePerUnit: 450, unit: "piece" },
    { id: "household-blanket-double-2ply", name: "Blanket Double 2 Ply", description: "Household dry clean.", pricePerUnit: 560, unit: "piece" },
    { id: "household-quilt-single", name: "Quilt Single", description: "Household dry clean.", pricePerUnit: 350, unit: "piece" },
    { id: "household-quilt-double", name: "Quilt Double", description: "Household dry clean.", pricePerUnit: 450, unit: "piece" },
    { id: "household-bedsheet-single", name: "Bed Sheet Single", description: "Household dry clean.", pricePerUnit: 120, unit: "piece" },
    { id: "household-bedsheet-double", name: "Bed Sheet Double", description: "Household dry clean.", pricePerUnit: 200, unit: "piece" },
    { id: "household-curtain-no-lining", name: "Curtain Door/Window (Without Lining)", description: "Starting from ₹165.", pricePerUnit: 165, unit: "piece" },
    { id: "household-curtain-with-lining", name: "Curtain Door/Window (With Lining)", description: "Starting from ₹290.", pricePerUnit: 290, unit: "piece" },
    { id: "household-carpet", name: "Carpet", description: "Household dry clean per sq.ft.", pricePerUnit: 45, unit: "sqft" },

    { id: "shoe-sports-canvas-sneaker", name: "Sports / Canvas / Sneaker", description: "Shoes dry clean service.", pricePerUnit: 350, unit: "pair" },
    { id: "shoe-leather", name: "Leather Shoes", description: "Shoes dry clean service.", pricePerUnit: 450, unit: "pair" },
    { id: "bag-handbag", name: "Handbag", description: "Starting from ₹500.", pricePerUnit: 500, unit: "piece" },
    { id: "bag-handbag-leather", name: "Handbag (Leather)", description: "Starting from ₹750.", pricePerUnit: 750, unit: "piece" },
  ];

  const services = [];
  for (const s of servicesData) {
    const service = await prisma.service.upsert({
      where: { id: s.id },
      update: { ...s },
      create: { ...s },
    });
    services.push(service);
    console.log(`✅ Service: ${service.name} — ₹${service.pricePerUnit}/${service.unit}`);
  }

  // 4. Create Sample Orders (Skipped for production so it doesn't clutter dashboard)
  /*
  const ordersData = [
    { serviceId: services[0].id, quantity: 5, totalAmount: 550, address: "C-12, Mansarovar, Jaipur", status: "DELIVERED", notes: "Please use fragrance-free detergent" },
    { serviceId: services[1].id, quantity: 3, totalAmount: 495, address: "A-45, Vaishali Nagar, Jaipur", status: "PROCESSING" },
    { serviceId: services[2].id, quantity: 2, totalAmount: 440, address: "B-78, Malviya Nagar, Jaipur", status: "PENDING", notes: "Handle with care - silk sarees" },
    { serviceId: services[0].id, quantity: 8, totalAmount: 880, address: "D-22, C-Scheme, Jaipur", status: "PICKED_UP" },
    { serviceId: services[3].id, quantity: 1, totalAmount: 149, address: "F-33, Tonk Road, Jaipur", status: "CONFIRMED" },
  ];

  for (const o of ordersData) {
    await prisma.order.create({
      data: { customerId: customer.id, ...o },
    });
  }
  console.log(`✅ ${ordersData.length} sample orders created`);
  */

  // 5. Create Content Entries
  const contentData = [
    { key: "hero_title", value: "Premium Laundry Experience", type: "text" },
    { key: "hero_subtitle", value: "Experience premium laundry and dry cleaning services with free doorstep pickup and delivery. We use advanced fabric care technology to keep your clothes fresh, clean, and perfectly cared for.", type: "text" },
    { key: "hero_cta", value: "Explore Services", type: "text" },
    { key: "cards_title", value: "Your Journey Begins Here", type: "text" },
    { key: "cards_subtitle", value: "We make every moment count with solutions designed just for you.", type: "text" },
    { key: "banner_title", value: "Fresh Clothes. Premium Care. Doorstep Delivery.", type: "text" },
    { key: "banner_subtitle", value: "Experience a smarter laundry service with expert fabric care, free pickup, and fast delivery.", type: "text" },
    { key: "trust_title", value: "Trusted By Thousands Of Happy Customers", type: "text" },
    { key: "stats_title", value: "Our Laundry Success Journey", type: "text" },
    { key: "footer_about", value: "LuxWash Premium Laundry provides expert fabric care with modern cleaning technology, doorstep pickup, and fast delivery service. We focus on quality, hygiene, and customer satisfaction with every order.", type: "text" },
  ];

  for (const c of contentData) {
    await prisma.content.upsert({
      where: { key: c.key },
      update: { value: c.value },
      create: c,
    });
  }
  console.log(`✅ ${contentData.length} content entries created`);

  // 6. Create Site Settings
  const settingsData = [
    { key: "site_name", value: "LUXURY LAUNDRY." },
    { key: "phone", value: "+91-9663574728" },
    { key: "email", value: "support@luxwash.com" },
    { key: "address", value: "Shop No. 504, Bagrota, Ajmer Road, Jaipur, Rajasthan" },
    { key: "hours", value: "Open All Week: 10:00 AM – 8:00 PM" },
    { key: "whatsapp", value: "+919663574728" },
    { key: "min_free_delivery", value: "4999" },
    { key: "pickup_charge", value: "100" },
  ];

  for (const s of settingsData) {
    await prisma.siteSettings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`✅ ${settingsData.length} site settings created`);

  // 7. Create Sample Contact Submissions
  const contactsData = [
    { name: "Priya Gupta", email: "priya@example.com", phone: "+919876500001", subject: "Bulk Laundry Inquiry", message: "Hi, I run a guest house and need regular laundry service for about 50kg per week. Can you offer a special rate?" },
    { name: "Amit Jain", email: "amit@example.com", subject: "Bridal Lehenga Dry Cleaning", message: "I need premium dry cleaning for a heavy bridal lehenga. What's the estimated cost and turnaround time?" },
  ];

  for (const c of contactsData) {
    await prisma.contactSubmission.create({ data: c });
  }
  console.log(`✅ ${contactsData.length} sample contact submissions created`);

  console.log("\n🎉 Database seeded successfully!\n");
  console.log("── Panel logins (role-based admin access) ──");
  console.log(`Owner:       ${ownerEmail} / ${ownerPassword}`);
  if (process.env.SEED_DEMO_PANEL_USERS === "true") {
    console.log("Super Admin: superadmin@luxwash.com / SuperAdmin@123");
    console.log("Admin:       admin@luxwash.com / Admin@12345");
    console.log("Staff:       staff@luxwash.com / Staff@12345");
    console.log("Delivery:    delivery@luxwash.com / Delivery@123");
  }
  console.log("Customer:    rahul@example.com / Customer@123\n");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
