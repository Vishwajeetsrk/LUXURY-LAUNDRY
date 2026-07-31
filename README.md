# LUXURY LAUNDRY (Jaipur) — Full-Stack Application

A modern, full-stack web application for **Luxury Laundry Jaipur** (LuxWash) built with Next.js, Express, Prisma, and PostgreSQL.

## Live URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://luxurylaundryjaipur.com |
| Backend API (Render) | https://luxury-laundry.onrender.com |
| Database | Render PostgreSQL (free tier) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Express 5, TypeScript, Prisma 7, Socket.io |
| Database | PostgreSQL (Render) |
| Auth | JWT + bcrypt |
| Hosting | Vercel (frontend), Render (backend + DB) |

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@luxwash.com | Admin@12345 |
| Super Admin | superadmin@luxwash.com | SuperAdmin@123 |
| Staff | staff@luxwash.com | Staff@12345 |
| Delivery | delivery@luxwash.com | Delivery@123 |
| Customer | rahul@example.com | Customer@123 |

---

## DEPLOYMENT (Step by Step)

### Step 1: Create Render PostgreSQL Database
1. Go to **Render Dashboard** → **New** → **PostgreSQL**
2. Name: `luxury-db`, Plan: **Free**
3. Click **Create Database** (~2 min)
4. Copy the **Internal Database URL**

### Step 2: Deploy Backend on Render
1. **Render Dashboard** → **New** → **Web Service**
2. Connect GitHub repo `Vishwajeetsrk/LUXURY-LAUNDRY`
3. Settings:
   - **Name:** `luxury-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npx prisma db push --skip-generate && npm run start`
4. **Environment Variables** (Environment tab):
   ```
   DATABASE_URL = <paste Internal Database URL from Step 1>
   JWT_SECRET = LxW_2026_xYz_98765_SuperSecretAdminKey
   NODE_ENV = production
   PORT = 10000
   ```
5. Click **Create Web Service**
6. Wait for deploy to finish (~3 min)

### Step 3: Seed Database Users
1. Render → luxury-backend → **Shell** tab
2. Run:
   ```bash
   npx ts-node prisma/seed.ts
   ```

### Step 4: Deploy Frontend on Vercel
1. **Vercel Dashboard** → **Import** GitHub repo
2. Framework: Next.js
3. Root Directory: `frontend`
4. **Environment Variables** (must add before deploy):
   ```
   NEXT_PUBLIC_API_URL = https://luxury-laundry.onrender.com
   ```
5. Click **Deploy**
6. After deploy, go to **Settings** → **Environment Variables** to verify

### Step 5: Verify
1. Backend health: https://luxury-laundry.onrender.com/api/health
2. Frontend: https://luxurylaundryjaipur.com
3. Login: `admin@luxwash.com` / `Admin@12345`

---

## ALL ENVIRONMENT VARIABLES

### Backend (Render Environment Tab)
| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | `postgresql://luxury_db_4pkz_user:fmUMfKIE9TRDJ6zjMmXQWt0KVFlHMELq@dpg-d9m9j9m7bikc73abgibg-a/luxury_db_4pkz` | Yes |
| `JWT_SECRET` | `LxW_2026_xYz_98765_SuperSecretAdminKey` | Yes |
| `NODE_ENV` | `production` | Yes |
| `PORT` | `10000` | Yes |
| `ADMIN_WHATSAPP_PHONE` | `+919663574728` | Optional |
| `ADMIN_PHONE_NUMBER` | `919663574728` | Optional |
| `ULTRAMSG_INSTANCE_ID` | your_instance_id | Optional |
| `ULTRAMSG_TOKEN` | your_token | Optional |

### Frontend (Vercel Environment Variables)
| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_API_URL` | `https://luxury-laundry.onrender.com` | Yes |

### Local Dev (backend/.env — NOT deployed)
```env
DATABASE_URL="postgresql://luxury_db_4pkz_user:fmUMfKIE9TRDJ6zjMmXQWt0KVFlHMELq@dpg-d9m9j9m7bikc73abgibg-a/luxury_db_4pkz"
PORT=5000
JWT_SECRET=LxW_2026_xYz_98765_SuperSecretAdminKey
ADMIN_WHATSAPP_PHONE=+919663574728
ADMIN_PHONE_NUMBER=919663574728
```

### Local Dev (frontend/.env.local — NOT deployed)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## ALL BACKEND API ENDPOINTS (67 total)

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server + DB health check |

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account (with optional welcome bonus) |
| POST | `/api/auth/login` | Sign in, returns JWT |
| GET | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Get current user profile |
| PATCH | `/api/auth/me` | Update profile (name, phone, addresses) |

### Orders (`/api/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders (admin=all, customer=own) |
| POST | `/api/orders` | Create order + auto-invoice + notifications |
| PATCH | `/api/orders/:id` | Update status/details |
| DELETE | `/api/orders/:id` | Delete order (admin) |

### Customers (`/api/customers`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers (admin) |
| GET | `/api/customers/:id` | Get customer + orders (admin) |
| PATCH | `/api/customers/:id` | Update customer (admin) |
| PUT | `/api/customers/me/addresses` | Update own addresses |
| DELETE | `/api/customers/:id` | Soft-delete (admin) |

### Services (`/api/services`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List all services (public) |
| POST | `/api/services` | Create service (admin) |
| PATCH | `/api/services/:id` | Update service (admin) |
| DELETE | `/api/services/:id` | Delete service (admin) |

### Invoices (`/api/invoices`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices with filters (admin) |
| GET | `/api/invoices/analytics` | Invoice stats (admin) |
| GET | `/api/invoices/customer/me` | Customer's invoices |
| GET | `/api/invoices/:id` | Invoice details |
| GET | `/api/invoices/:id/pdf` | Download PDF |
| GET | `/api/invoices/:id/whatsapp-url` | WhatsApp share link |
| POST | `/api/invoices/create/:orderId` | Create from order (admin) |
| POST | `/api/invoices/manual` | Manual invoice (admin) |
| PATCH | `/api/invoices/:id/status` | Update payment status (admin) |
| DELETE | `/api/invoices/:id` | Archive (admin) |

### Reviews (`/api/reviews`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews` | Published reviews (public) |
| GET | `/api/reviews/admin` | All reviews (admin) |
| POST | `/api/reviews` | Submit review (customer) |
| PATCH | `/api/reviews/:id` | Toggle publish (admin) |
| DELETE | `/api/reviews/:id` | Delete review (admin) |

### Packages (`/api/packages`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/packages` | Active packages (public) |
| POST | `/api/packages` | Create (admin) |
| PATCH | `/api/packages/:id` | Update (admin) |
| DELETE | `/api/packages/:id` | Delete (admin) |

### Subscriptions (`/api/subscriptions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscriptions` | Request subscription (customer) |
| GET | `/api/subscriptions` | List requests (admin) |
| PATCH | `/api/subscriptions/:id` | Approve/reject (admin) |

### Offers (`/api/offers`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/offers` | Active offers (public) |
| GET | `/api/offers/admin` | All offers (admin) |
| POST | `/api/offers` | Create offer (admin) |
| PATCH | `/api/offers/:id` | Update (admin) |
| DELETE | `/api/offers/:id` | Delete (admin) |

### Shop Products (`/api/shop-products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shop-products` | Active products (public) |
| POST | `/api/shop-products` | Create (admin) |
| PATCH | `/api/shop-products/:id` | Update (admin) |
| DELETE | `/api/shop-products/:id` | Delete (admin) |

### Price List (`/api/price-list`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/price-list` | All items (public) |
| POST | `/api/price-list` | Create (admin) |
| PUT | `/api/price-list/:id` | Update (admin) |
| DELETE | `/api/price-list/:id` | Delete (admin) |

### Wallet (`/api/wallet`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/me` | Balance + history |
| POST | `/api/wallet/admin/adjust` | Adjust credits (admin) |

### Content & Settings (`/api/content`, `/api/settings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content` | All content items (public) |
| GET | `/api/content/settings` | All settings (public) |
| PATCH | `/api/content/:key` | Update content/setting (admin) |
| GET | `/api/settings/:key` | Get single setting |
| POST | `/api/settings` | Bulk update settings (admin) |

### Contact (`/api/contact`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit form (public) |
| GET | `/api/contact` | List submissions (admin) |
| DELETE | `/api/contact/:id` | Delete submission (admin) |

### Reports (`/api/reports`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/excel` | Export Excel (admin) |
| GET | `/api/reports/pdf` | Export PDF (admin) |

### Delivery (`/api/delivery`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/delivery/assign` | Assign order + OTP (admin) |
| POST | `/api/delivery/verify-otp` | Verify OTP (delivery) |
| POST | `/api/delivery/attendance` | Mark attendance |

### WhatsApp (`/api/whatsapp`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/whatsapp/logs` | View logs (admin) |
| DELETE | `/api/whatsapp/logs/:id` | Delete log (admin) |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Stats, charts, recent orders (admin) |

---

## ALL FRONTEND PAGES (33 total)

### Public Pages
| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, features, services, testimonials, stats, contact |
| `/shop` | Browse products with add-to-cart |
| `/shop/cart` | Cart, apply coupons, checkout |
| `/pricing` | Packages + price list |
| `/our-services` | Service catalog |
| `/about-us` | Company info |
| `/contactus` | Contact form + business details |
| `/help` | FAQ |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/invoices` | Customer invoices (login required) |
| `/invoices/[id]` | Invoice detail + PDF download |

### Auth Pages
| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Create account |

### Customer Dashboard
| Route | Description |
|-------|-------------|
| `/dashboard` | Overview — orders, spending |
| `/dashboard/orders` | Order history + leave reviews |
| `/dashboard/orders/[id]` | Order detail + tracking |
| `/dashboard/wallet` | Balance + transactions |
| `/dashboard/invoices` | Invoice list |
| `/dashboard/profile` | Edit profile |

### Admin Panel
| Route | Description |
|-------|-------------|
| `/admin` | Dashboard — stats, charts, recent orders |
| `/admin/orders` | Manage all orders |
| `/admin/customers` | Manage customers |
| `/admin/services` | CRUD services |
| `/admin/invoices` | Manage invoices + analytics |
| `/admin/packages` | CRUD packages |
| `/admin/offers` | CRUD discount codes |
| `/admin/subscriptions` | Approve/reject subscriptions |
| `/admin/content` | CMS editor |
| `/admin/settings` | Site settings |
| `/admin/reviews` | Moderate reviews |
| `/admin/contacts` | View inquiries |
| `/admin/shop` | CRUD shop products |
| `/admin/price-list` | CRUD price list |
| `/admin/whatsapp` | WhatsApp logs |

---

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
│   │   ├── context/          # React contexts (Cart, Content)
│   │   └── lib/              # Utilities, API helpers
│   └── public/images/        # Static assets
├── backend/                   # Express API backend
│   ├── src/
│   │   ├── routes/           # API routes (20 files)
│   │   ├── middleware/       # JWT auth, validation
│   │   ├── lib/              # Prisma client, JWT, permissions
│   │   ├── services/         # Business logic
│   │   └── pdf/              # PDF generation
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── seed.ts           # Seed data
│   │   └── prisma.config.ts  # Prisma v7 config
│   └── render.yaml           # Render deployment config
├── render.yaml                # Render Blueprint
└── README.md
```

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (local or cloud)

### Setup
```bash
# Backend
cd backend
npm install
npx prisma db push
npx prisma generate
npm run seed
npm run dev
# Runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Unable to connect to server` | Set `NEXT_PUBLIC_API_URL` in Vercel env vars |
| `500 error on login` | Check `DATABASE_URL` in Render Environment tab |
| `ENOTFOUND tenant/user` | Database URL points to deleted instance — create new one |
| `Invalid email or password` | Run seed: Render Shell → `npx ts-node prisma/seed.ts` |
| `Table does not exist` | `prisma db push` runs on deploy — check Render build logs |
| `Token expired` | JWT expires after 7 days; log in again |
| `Render cold start (~50s)` | Free tier spins down with inactivity |
| `Database expires` | Free Render PostgreSQL expires after 30 days |

## License

Private — All rights reserved.
