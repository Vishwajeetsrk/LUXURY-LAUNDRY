# 🧺 LUXURY LAUNDRY (Jaipur) — Full-Stack Application

A modern, full-stack web application for **Luxury Laundry Jaipur** (LuxWash) built with Next.js 16, Express, Prisma, and PostgreSQL.

## 🏗️ Tech Stack

| Layer     | Technology                              |
|-----------|----------------------------------------|
| Frontend  | Next.js 16.2 (Turbopack), TypeScript, Tailwind CSS |
| Backend   | Express 5, TypeScript, Prisma 7        |
| Database  | PostgreSQL (via Prisma)                |
| Auth      | JWT + bcrypt                           |

## ✨ Comprehensive Feature List

### 🛍️ User Features & User Dashboard (`/dashboard`)
- **Authentication:** Secure Registration & Login with JWT.
- **Profile Management:** Users can update their contact details and view their active subscription plans.
- **Order Placement:** Users can book laundry services with specific pickup/delivery instructions.
- **Order History (`/dashboard/orders`):** Track current order statuses (Pending, Processing, Delivered, etc.).
- **Invoice Tracking (`/dashboard/invoices`):** View, download, and track payment status for past and current invoices.
- **Shop & Cart (`/shop`):** Browse service packages, view AI-matched luxury product images, add items to cart, and checkout seamlessly.
- **Coupon System:** Apply dynamic promotional codes and automatically calculate discounts before checkout.
- **Subscriptions & Packages:** Request monthly/yearly laundry subscription plans or buy prepaid packages to get wallet credits.
- **Wallet System & Welcome Bonus:** New users can receive an automated welcome bonus, and users can pay for orders via their wallet balance.
- **Customer Reviews (`/dashboard/orders`):** Customers can leave a 1-5 star review and written feedback on any order marked as "DELIVERED".

### 🛡️ Admin Dashboard (`/admin`)
- **Real-Time Analytics:** Live dashboard with WebSocket (Socket.io) integration for real-time order updates and percentage growth trends (Orders, Revenue, Customers).
- **Order Management (`/admin/orders`):** View all customer orders, filter by status, update states, and assign delivery dates.
- **Invoice Management (`/admin/invoices`):** 
  - Automatically or manually generate invoices linked to orders.
  - Detailed tax breakdowns (CGST/SGST applied).
  - Track payment status (Paid, Unpaid, Overdue).
  - Auto-generated sequential invoice numbers.
- **Customer Management (`/admin/customers`):** View registered users, track their order history, and update their details/discounts.
- **Service & Product Catalog (`/admin/services`):** Add, edit, disable, or delete laundry services. Now supports setting custom **Image URLs** and **Original Prices** to manually override dynamic discounts.
- **Content Management System (`/admin/content`):** Dynamically edit website text, banners, and descriptions without touching code.
- **Reviews Moderation (`/admin/reviews`):** Review customer feedback, delete spam, and securely toggle a review's `Published` status on or off to push it to the public homepage.
- **WhatsApp Integration (`/admin/whatsapp`):** View logs of automated WhatsApp messages (order updates, invoice links) sent to customers via UltraMsg.
- **Inquiries (`/admin/contacts`):** View and respond to customer queries from the Contact Us form.
- **Packages Management (`/admin/packages`):** Create and manage subscription packages with automated wallet credit logic and discounts.
- **Offers & Promotions (`/admin/offers`):** Generate and manage custom discount codes, tracking usage limits and conditions.
- **Site Settings & Welcome Bonus (`/admin/settings`):** Global configurations like company phone, email, social links, and auto-assignable Welcome Bonus wallet credits.
- **Premium UI/UX (Luxury Theme):** The entire application features a premium "Luxury Gold & Royal Navy" theme with glassmorphism effects (`backdrop-filter`), hover glow effects, and fintech-level data tables.

## 📁 Project Structure

```
LAUNDRYYY/
├── frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/     # Public pages (Home, Services, Pricing, etc.)
│   │   │   ├── admin/        # Admin dashboard
│   │   │   ├── dashboard/    # User dashboard
│   │   │   ├── login/        # Login page
│   │   │   └── register/     # Register page
│   │   └── components/       # Reusable components
│   └── public/images/        # Image assets
├── backend/           # Express API backend
│   ├── src/
│   │   ├── routes/           # API routes (auth, orders, services, invoices)
│   │   ├── middleware/       # JWT auth middleware
│   │   └── lib/              # Prisma client
│   ├── prisma/
│   │   ├── schema.prisma     # PostgreSQL schema
│   │   └── seed.ts           # Seed data
│   └── generated/            # Prisma generated client
└── README.md
```

## 🚀 Operations & Setup Guide (How to Run Everything)

### 1. Database Setup (PostgreSQL)
The application uses PostgreSQL as its database. You can either use a local Postgres installation or a cloud provider like [Supabase](https://supabase.com/).

1. Create your database and get the connection string.
2. In the `backend/.env` file, update the `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://username:password@your-db-host:5432/your_database"
   ```
3. Push the Prisma schema to create tables:
   ```bash
   cd backend
   npx prisma db push
   npx prisma generate
   ```

### 2. How to Run the Website (Backend & Frontend)

To run the application locally, you need to start **both** the backend API and the frontend Next.js server in separate terminal windows.

**Terminal 1 (Start Backend):**
```bash
cd backend
npm install
npm run dev
```
*(The backend API will run on http://localhost:5000)*

**Terminal 2 (Start Frontend):**
```bash
cd frontend
npm install
npm run dev
```
*(The website will run on http://localhost:3000)*

---

### 3. How to Change Admin User/Email and Password

The initial admin user is created using a backend script. If you want to change the admin login details (Email or Password):

1. Open the file `backend/create-admin.ts` in your code editor.
2. Modify lines 7 and 8 to your desired credentials:
   ```typescript
   const email = 'your_new_admin@gmail.com';
   const password = 'your_new_password';
   ```
3. Run the script in the backend directory:
   ```bash
   cd backend
   npx ts-node create-admin.ts
   ```
   *(This will safely hash the new password and update the database with SUPER_ADMIN privileges).*

### 4. How to See the Users (Customers)

There are two ways to view all registered users and customers:

**Method 1: Via the Admin Panel (Recommended)**
1. Log in to the website using your Admin credentials at `http://localhost:3000/login`.
2. Navigate to the **Admin Dashboard**.
3. Click on **Customers** (`/admin/customers`) in the sidebar.
4. Here you can view, search, and manage all users, their order histories, and assign discounts.

**Method 2: Via Database (Prisma Studio)**
If you want direct database access to view the `User` table:
```bash
cd backend
*(This opens a clean UI at http://localhost:5555 where you can directly view and edit the database tables).*
```
---

### 5. Deployment Links & Live Environments

The application is fully configured for continuous deployment using modern cloud providers.

1. **Frontend (Vercel):** [https://luxurylaundry.vercel.app](https://luxurylaundry.vercel.app)
   - *Pulls from GitHub `main` branch.*
   - *Environment variables securely stored in Vercel settings.*
2. **Backend API (Render):** [https://luxury-laundry.onrender.com](https://luxury-laundry.onrender.com)
   - *Deployed via `render.yaml` infrastructure-as-code.*
3. **Database (Supabase):** Managed PostgreSQL via Supabase connection strings.

## 🔑 Demo Credentials

| Role     | Email                   | Password       | Access Level |
|----------|-------------------------|----------------|--------------|
| Admin    | admin@luxwash.com       | Admin@12345    | Full system control, analytics, financial settings |
| Super Admin | superadmin@luxwash.com | SuperAdmin@123 | Full system control |
| Staff    | staff@luxwash.com       | Staff@12345    | Can manage orders, services, and customers |
| Delivery | delivery@luxwash.com    | Delivery@123   | Can view assigned orders and update delivery status |
| Customer | rahul@example.com       | Customer@123   | Standard user, can book orders and leave reviews |

**Note on Role-Based Access Control (RBAC):**
The backend enforces strict permissions via the `backend/src/middleware/auth.ts` middleware. 
- The `panelAccess` logic ensures only `SUPER_ADMIN`, `ADMIN`, `STAFF`, and `DELIVERY` roles can access the `/admin` routes.
- The `requirePermission` logic ensures that only high-level admins can modify financial settings, change business data, or delete users.
- The `adminOnly` logic completely shields sensitive API endpoints (like generating API keys or WhatsApp setup) from basic Staff and Delivery users.

## 📊 Database Schema Highlights

- **User** — Customers, Staff, Delivery, Admins
- **Order** — Customer orders for specific laundry services
- **Service** & **ShopProduct** — Available offerings (with `imageUrl`, `originalPrice`, `rating`, `reviewCount` fields)
- **Review** — Customer 1-5 star ratings and comments, moderated by admin with `isPublished` flag
- **Invoice** & **InvoiceItem** — Advanced billing system with tax breakdowns (CGST/SGST)
- **WhatsAppLog** — Tracking external WhatsApp communications
- **AuditLog** — Tracking admin actions
- **SubscriptionRequest** & **Package** — Tracking user subscription plans and prepaid packages
- **WalletTransaction** — Financial ledger tracking customer wallet balance operations
- **Offer** — Promotional campaigns and discount rules engine

## 📞 Business Information

- **Name**: LUXURY LAUNDRY / LuxWash Premium Laundry
- **Website**: https://luxurylaundryjaipur.com
- **Address**: Shop No. 504, Bagrota, Ajmer Road, Jaipur, Rajasthan
- **Phone**: +91-9663574728
- **Email**: support@luxwash.com
- **Hours**: Open All Week: 10:00 AM – 8:00 PM
