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
- **Shop & Cart (`/shop`):** Browse service packages, add items to cart, and checkout seamlessly.
- **Subscriptions:** Request monthly/yearly laundry subscription plans.

### 🛡️ Admin Dashboard (`/admin`)
- **Overview Dashboard:** High-level statistics, revenue, recent orders, and quick actions.
- **Order Management (`/admin/orders`):** View all customer orders, filter by status, update states, and assign delivery dates.
- **Invoice Management (`/admin/invoices`):** 
  - Automatically or manually generate invoices linked to orders.
  - Detailed tax breakdowns (CGST/SGST applied).
  - Track payment status (Paid, Unpaid, Overdue).
  - Auto-generated sequential invoice numbers.
- **Customer Management (`/admin/customers`):** View registered users, track their order history, and update their details/discounts.
- **Service & Product Catalog (`/admin/services`, `/admin/shop`):** Add, edit, disable, or delete laundry services and shop products dynamically.
- **Content Management System (`/admin/content`):** Dynamically edit website text, banners, and descriptions without touching code.
- **WhatsApp Integration (`/admin/whatsapp`):** View logs of automated WhatsApp messages (order updates, invoice links) sent to customers via UltraMsg.
- **Inquiries (`/admin/contacts`):** View and respond to customer queries from the Contact Us form.
- **Site Settings (`/admin/settings`):** Global configurations like company phone, email, and social links.

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

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- A PostgreSQL Database (e.g., local Postgres or Supabase)

### Environment Variables
The backend needs a `.env` inside `backend/`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/db_name"
JWT_SECRET="your_jwt_secret"
PORT=5000
FRONTEND_URL=http://localhost:3000
```
The frontend needs a `.env` inside `frontend/`:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

### 1. Backend Setup

```bash
cd backend
npm install
npm run setup  # push schema + generate client + seed data
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🔑 Demo Credentials

| Role     | Email                   | Password |
|----------|-------------------------|----------|
| Admin    | vishwajeetsrk@gmail.com | 12345678 |

## 📊 Database Schema Highlights

- **User** — Customers, Staff, Delivery, Admins
- **Order** — Customer orders for specific laundry services
- **Service** & **ShopProduct** — Available offerings
- **Invoice** & **InvoiceItem** — Advanced billing system with tax breakdowns (CGST/SGST)
- **WhatsAppLog** — Tracking external WhatsApp communications
- **AuditLog** — Tracking admin actions
- **SubscriptionRequest** — Tracking user subscription plans

## 📞 Business Information

- **Name**: LUXURY LAUNDRY / LuxWash Premium Laundry
- **Website**: https://luxurylaundryjaipur.com
- **Address**: Shop No. 504, Bagrota, Ajmer Road, Jaipur, Rajasthan
- **Phone**: +91-9663574728
- **Email**: support@luxwash.com
- **Hours**: Open All Week: 10:00 AM – 8:00 PM
