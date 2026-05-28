"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("../generated/prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({
    url: "file:./prisma/dev.db",
});
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log("🌱 Seeding database...\n");
    // 1. Create Admin User
    const adminPassword = await bcryptjs_1.default.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@luxwash.com" },
        update: {},
        create: {
            name: "Admin",
            email: "admin@luxwash.com",
            password: adminPassword,
            phone: "+919663574728",
            role: "ADMIN",
        },
    });
    console.log("✅ Admin user created:", admin.email);
    // 2. Create Sample Customer
    const custPassword = await bcryptjs_1.default.hash("customer123", 10);
    const customer = await prisma.user.upsert({
        where: { email: "rahul@example.com" },
        update: {},
        create: {
            name: "Rahul Sharma",
            email: "rahul@example.com",
            password: custPassword,
            phone: "+919876543210",
            role: "CUSTOMER",
        },
    });
    console.log("✅ Sample customer created:", customer.email);
    // 3. Create Services
    const servicesData = [
        { name: "Wash & Fold", description: "Fresh washing, premium detergents and neat folding for your everyday clothes.", pricePerUnit: 110, unit: "kg" },
        { name: "Wash & Steam Iron", description: "Deep cleaning with crisp steam ironing for a perfectly finished look.", pricePerUnit: 165, unit: "kg" },
        { name: "Premium Dry Cleaning", description: "Expert care for suits, sarees, jackets, lehengas and delicate garments with premium fabric treatment.", pricePerUnit: 220, unit: "piece" },
        { name: "Shoe Spa", description: "Complete shoe cleaning, deodorizing and restoration service for all types of footwear.", pricePerUnit: 149, unit: "pair" },
        { name: "Home Care Laundry", description: "Professional cleaning for curtains, bedsheets, sofa covers, carpets and more.", pricePerUnit: 89, unit: "piece" },
    ];
    const services = [];
    for (const s of servicesData) {
        const service = await prisma.service.upsert({
            where: { id: s.name.toLowerCase().replace(/[^a-z0-9]/g, "-") },
            update: { ...s },
            create: { id: s.name.toLowerCase().replace(/[^a-z0-9]/g, "-"), ...s },
        });
        services.push(service);
        console.log(`✅ Service: ${service.name} — ₹${service.pricePerUnit}/${service.unit}`);
    }
    // 4. Create Sample Orders
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
        { key: "min_free_delivery", value: "499" },
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
    console.log("Admin login: admin@luxwash.com / admin123");
    console.log("Customer login: rahul@example.com / customer123\n");
}
main()
    .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map