# 🧺 LUXURY LAUNDRY — Full-Stack Application

A modern, full-stack web application for **LuxWash Premium Laundry Service** built with Next.js, Express, Prisma, and SQLite.

## 🏗️ Tech Stack

| Layer     | Technology                              |
|-----------|----------------------------------------|
| Frontend  | Next.js 15, TypeScript, Tailwind CSS   |
| Backend   | Express 5, TypeScript, Prisma 7        |
| Database  | SQLite (via better-sqlite3 adapter)    |
| Auth      | JWT + bcrypt                           |

## 📁 Project Structure

```
LAUNDRYYY/
├── frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/     # Public pages (Home, Services, Pricing, etc.)
│   │   │   ├── admin/        # Admin dashboard
│   │   │   ├── login/        # Login page
│   │   │   └── register/     # Register page
│   │   └── components/       # Reusable components
│   └── public/images/        # Image assets
├── backend/           # Express API backend
│   ├── src/
│   │   ├── routes/           # API routes (auth, orders, services, etc.)
│   │   ├── middleware/       # JWT auth middleware
│   │   └── lib/              # Prisma client
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── seed.ts           # Seed data
│   │   └── dev.db            # SQLite database (auto-created)
│   └── generated/            # Prisma generated client
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup database (push schema + generate client + seed data)
npm run setup

# Start development server
npm run dev
```

The API will be running at **http://localhost:5001**

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The website will be at **http://localhost:3000**

## 🔑 Demo Credentials

| Role     | Email               | Password   |
|----------|---------------------|------------|
| Admin    | admin@luxwash.com   | admin123   |
| Customer | rahul@example.com   | customer123|

## 📄 Pages

### Public Pages
- **Home** (`/`) — Hero, services, stats, contact form, trust badges
- **Services** (`/our-services`) — All 5 services with details & pricing
- **Pricing** (`/pricing`) — 3-tier pricing cards + additional pricing
- **About Us** (`/about-us`) — Company story, values, team
- **Contact** (`/contactus`) — Contact form, business info, hours
- **Shop** (`/shop`) — Service packs with ratings & cart
- **News** (`/news`) — Blog posts
- **Help** (`/help`) — FAQ accordion + support contacts

### Admin Dashboard (`/admin`)
- **Dashboard** — Stats overview, recent orders, quick actions
- **Orders** — View all orders, filter by status, update order status
- **Customers** — View all registered customers with search
- **Services** — Add/edit/delete services, manage pricing
- **Content** — CMS editor for website text content
- **Inquiries** — View contact form submissions with reply
- **Settings** — Business info, phone, email, social links

## 🛠️ API Endpoints

| Method | Endpoint              | Auth     | Description              |
|--------|----------------------|----------|--------------------------|
| POST   | /api/auth/register   | Public   | Create new account       |
| POST   | /api/auth/login      | Public   | Login and get JWT        |
| GET    | /api/auth/me         | Auth     | Get current user         |
| GET    | /api/services        | Public   | List all services        |
| POST   | /api/services        | Admin    | Create service           |
| PATCH  | /api/services/:id    | Admin    | Update service           |
| DELETE | /api/services/:id    | Admin    | Delete service           |
| GET    | /api/orders          | Auth     | List orders              |
| POST   | /api/orders          | Auth     | Create order             |
| PATCH  | /api/orders/:id      | Auth     | Update order status      |
| DELETE | /api/orders/:id      | Admin    | Delete order             |
| GET    | /api/customers       | Admin    | List all customers       |
| POST   | /api/contact         | Public   | Submit contact form      |
| GET    | /api/contact         | Admin    | View all submissions     |
| GET    | /api/content         | Public   | Get page content         |
| PATCH  | /api/content/:key    | Admin    | Update content           |
| GET    | /api/dashboard/stats | Admin    | Dashboard statistics     |

## 📊 Database Schema

- **User** — id, name, email, password, phone, role (ADMIN/CUSTOMER)
- **Service** — id, name, description, pricePerUnit, unit, isActive
- **Order** — id, customer, service, status, quantity, totalAmount, address
- **ContactSubmission** — id, name, email, phone, subject, message
- **Content** — key-value content pairs for CMS
- **SiteSettings** — key-value site configuration

## 💰 Services & Pricing

| Service             | Price          |
|---------------------|----------------|
| Wash & Fold         | ₹110/kg        |
| Wash & Steam Iron   | ₹165/kg        |
| Premium Dry Cleaning| ₹220+/piece    |
| Shoe Spa            | ₹149+/pair     |
| Home Care Laundry   | ₹89+/piece     |

**Free pickup & delivery** on orders above ₹499
**₹100 pickup charge** for orders below ₹499

## 📞 Business Information

- **Name**: LUXURY LAUNDRY. / LuxWash Premium Laundry
- **Address**: Shop No. 504, Bagrota, Ajmer Road, Jaipur, Rajasthan
- **Phone**: +91-9663574728
- **Email**: support@luxwash.com
- **Hours**: Open All Week: 10:00 AM – 8:00 PM
