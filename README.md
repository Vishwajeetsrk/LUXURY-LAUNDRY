# LUXURY LAUNDRY (Jaipur) — Full-Stack Application

A modern, full-stack web application for **Luxury Laundry Jaipur** (LuxWash) built with Next.js, Express, Prisma, and PostgreSQL.

## Tech Stack

| Layer     | Technology                                          |
|-----------|----------------------------------------------------|
| Frontend  | Next.js 16 (Turbopack), TypeScript, Tailwind CSS   |
| Backend   | Express 5, TypeScript, Prisma 7, Socket.io          |
| Database  | PostgreSQL (via Prisma)                             |
| Auth      | JWT + bcrypt                                        |
| Hosting   | Vercel (frontend), Render (backend + database)      |

## Features

### Customer Features (`/dashboard`)
- Secure registration and login with JWT
- Profile management
- Order placement with pickup/delivery instructions
- Order history and tracking (`/dashboard/orders`)
- Invoice viewing and PDF download (`/dashboard/invoices`)
- Shop service packages (`/shop`) with cart and checkout
- Coupon system with dynamic discounts
- Subscription plans and prepaid packages
- Wallet system with welcome bonus
- Customer reviews on delivered orders

### Admin Dashboard (`/admin`)
- Real-time analytics with WebSocket (Socket.io)
- Order management with status updates and delivery assignment
- Invoice management with tax breakdowns (CGST/SGST)
- Customer management with order history
- Service and product catalog management
- Content management system (CMS)
- Reviews moderation with publish toggle
- WhatsApp message logs
- Contact inquiry management
- Subscription package management
- Offers and promotions with discount codes
- Site settings and welcome bonus configuration

### Public Pages
- Home with hero, features, services, testimonials, trust badges
- Services catalog (`/our-services`)
- Pricing with packages and price list (`/pricing`)
- Shop (`/shop`) with product browsing and cart
- About Us (`/about-us`)
- Contact Us (`/contactus`)
- Help & FAQ (`/help`)
- Privacy Policy (`/privacy`)
- Terms of Service (`/terms`)

## Project Structure

```
jaipur_laundryy-master/
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/     # Public pages
│   │   │   ├── admin/        # Admin dashboard
│   │   │   ├── dashboard/    # User dashboard
│   │   │   ├── login/        # Login page
│   │   │   └── register/     # Register page
│   │   ├── components/       # Reusable components
│   │   │   ├── home/         # Homepage sections
│   │   │   ├── layout/       # Navbar, Footer
│   │   │   ├── seo/          # Structured data
│   │   │   └── ui/           # Shared UI components
│   │   ├── context/          # React contexts (Cart, Content)
│   │   └── lib/              # Utilities, API helpers
│   └── public/images/        # Static assets
├── backend/                   # Express API backend
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # JWT auth, validation
│   │   ├── lib/              # Prisma client, JWT, permissions
│   │   ├── services/         # Business logic (invoices, notifications)
│   │   └── pdf/              # PDF generation
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── seed.ts           # Seed data
│   │   └── prisma.config.ts  # Prisma v7 config
│   └── render.yaml           # Render deployment config
├── render.yaml                # Render Blueprint (IaC)
└── README.md
```

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud)

### 1. Database Setup

Create a PostgreSQL database and update `backend/.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

Push the schema:
```bash
cd backend
npx prisma db push
npx prisma generate
```

### 2. Seed the Database

```bash
cd backend
npm run seed
```

### 3. Start the Servers

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

## Deployment

### Live URLs
- **Frontend (Vercel):** https://luxurylaundryjaipur.com
- **Backend API (Render):** https://luxury-laundry.onrender.com
- **Database:** Render PostgreSQL (free tier, expires Aug 30 2026)

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set the root directory to `frontend`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://luxury-laundry.onrender.com
   ```
4. Deploy

### Backend (Render)
1. Connect your GitHub repo to Render
2. Use the `render.yaml` blueprint or create a new Web Service
3. Set environment variables in the **Environment** tab:
   ```
   DATABASE_URL=your_render_postgres_internal_url
   JWT_SECRET=auto-generated_or_your_secret
   NODE_ENV=production
   ```
4. Deploy — Render runs `prisma db push` then `npm run start` automatically

### Database (Render PostgreSQL)
1. Create a PostgreSQL database in Render (Free tier)
2. Copy the **Internal Database URL** to `DATABASE_URL` in your backend's Environment tab
3. The schema is auto-pushed on each deploy via `prisma db push`

### After First Deploy — Seed Users
The database tables are created automatically, but demo users need to be seeded manually:
1. Go to Render → your backend service → **Shell** tab
2. Run: `npx ts-node prisma/seed.ts`

## Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://...        # Required
JWT_SECRET=your-secret-key           # Required (auto-generated if missing)
NODE_ENV=production                  # Set on Render
ADMIN_WHATSAPP_PHONE=+91XXXXXXXXXX  # Optional: WhatsApp integration
ADMIN_PHONE_NUMBER=XXXXXXXXXX       # Optional: fallback phone
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000  # Backend API URL
```

## Demo Credentials

> **Important:** Change these before deploying to production.

| Role        | Email                   | Password       | Access                                  |
|-------------|-------------------------|----------------|-----------------------------------------|
| Admin       | admin@luxwash.com       | Admin@12345    | Full system control                     |
| Super Admin | superadmin@luxwash.com  | SuperAdmin@123 | Full system control                     |
| Staff       | staff@luxwash.com       | Staff@12345    | Manage orders, services, customers      |
| Delivery    | delivery@luxwash.com    | Delivery@123   | View assigned orders, update delivery   |
| Customer    | rahul@example.com       | Customer@123   | Book orders, leave reviews              |

### Changing Admin Credentials

Edit `backend/create-admin.ts` and run:
```bash
cd backend
npx ts-node create-admin.ts
```

Or update via the seed script:
```bash
cd backend
npm run seed
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in
- `POST /api/auth/logout` — Sign out

### Orders
- `GET /api/orders` — List orders
- `POST /api/orders` — Create order
- `PATCH /api/orders/:id` — Update order status

### Services
- `GET /api/services` — List services
- `POST /api/services` — Create service (admin)
- `PUT /api/services/:id` — Update service (admin)
- `DELETE /api/services/:id` — Delete service (admin)

### Invoices
- `GET /api/invoices` — List invoices
- `GET /api/invoices/customer/me` — Current user's invoices
- `GET /api/invoices/:id` — Invoice details
- `POST /api/invoices/:id/pdf` — Download PDF

### Reviews
- `GET /api/reviews` — List published reviews
- `POST /api/reviews` — Submit review

### Wallet
- `GET /api/wallet/me` — Current user's wallet
- `POST /api/wallet/add` — Add funds

### Packages
- `GET /api/packages` — List packages
- `POST /api/packages` — Create package (admin)

### Content & Settings
- `GET /api/content` — Get site content
- `PUT /api/content` — Update content (admin)
- `GET /api/settings` — Get site settings
- `PUT /api/settings` — Update settings (admin)

### Contacts
- `POST /api/contacts` — Submit contact form
- `GET /api/contacts` — List inquiries (admin)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `500 error on login` | Check `DATABASE_URL` is set correctly in Render Environment tab |
| `ENOTFOUND tenant/user` | Database URL points to deleted instance — create a new Render PostgreSQL |
| `Cannot connect to backend` | Verify `NEXT_PUBLIC_API_URL` points to running backend |
| `Invalid email or password` | Run seed: Render Shell → `npx ts-node prisma/seed.ts` |
| `Prisma error: table does not exist` | `prisma db push` runs on deploy — check Render build logs |
| `Token expired` | JWT tokens expire after 7 days; log in again |
| `Render cold start (~50s)` | Free tier instances spin down with inactivity |
| `Database expires in 30 days` | Free Render PostgreSQL expires — upgrade or create new one |
| `Database connection refused` | Ensure `DATABASE_URL` uses `?sslmode=require` for Render |

## License

Private — All rights reserved.
