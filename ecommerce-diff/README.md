# AURA — Luxury Futuristic E-Commerce

Production-ready full-stack e-commerce platform for shoes, watches, and jewellery. Modular React frontend, enterprise NestJS backend, PostgreSQL + TypeORM, JWT auth, COD checkout, separate user + admin panels — all dressed in a matte-black, glass-morphic luxury design system inspired by the AURA mockup.

```
ecommerce-diff/
├── backend/   NestJS · PostgreSQL · TypeORM · JWT · Swagger
└── frontend/  React 18 · Redux Toolkit · React Router · SCSS · Vite
```

---

## Tech stack

**Backend** — NestJS 10, TypeORM 0.3, PostgreSQL, Passport JWT, class-validator, Helmet, Throttler, Swagger.

**Frontend** — React 18, React Router v6, Redux Toolkit, Axios (with refresh-token interceptor), SCSS modules, lazy loading, react-hot-toast.

---

## 1 · Setup

### Prereqs
- Node.js 20+
- PostgreSQL 14+ running locally (or update connection details in `.env`)

### Backend

```bash
cd backend
cp .env.example .env             # then edit DB credentials + JWT secrets
npm install
createdb aura_ecommerce           # or use pgAdmin / psql to create the DB
npm run start:dev                 # starts on :4000 — schema auto-syncs with DB_SYNCHRONIZE=true
npm run seed                      # seeds admin user, demo user, full luxury catalogue
```

Default seeded credentials:
- **Admin** — `admin@aura.luxe` / `admin@123`
- **Guest** — `guest@aura.luxe` / `guest@123`

Swagger lives at <http://localhost:4000/docs>.

### Frontend

```bash
cd frontend
cp .env.example .env              # VITE_API_BASE_URL defaults to backend dev port
npm install
npm run dev                       # opens on :5173
```

Open <http://localhost:5173>. Sign in with the guest credentials to browse the user panel, or visit <http://localhost:5173/admin/login> with the admin credentials for the atelier.

---

## 2 · Architecture

### Backend
```
src/
├── common/          guards, filters, interceptors, decorators, dto, enums, utils
├── config/          typed env config (app, database, jwt)
├── database/        DataSource + seed runner + migrations folder
├── modules/
│   ├── auth/        register, login, refresh, OTP, reset password
│   ├── users/       profile + addresses + admin CRUD
│   ├── product-types/  Shoes · Watches · Jewellery (CRUD)
│   ├── products/    products + variants + images
│   ├── cart/        cart items per user
│   ├── wishlist/    wishlist items per user
│   ├── orders/      COD order placement + status workflow
│   └── dashboard/   admin metrics + recent orders
├── shared/          BaseEntity (uuid, timestamps, soft delete)
├── app.module.ts
└── main.ts          Helmet, CORS, validation, versioned API, Swagger
```

### Frontend
```
src/
├── App.jsx
├── index.jsx
├── assets/
│   └── scss/        tokens, reset, typography, layout, buttons, forms, components
├── components/      Helmet, ProductCard, Pagination, StatusBadge, loaders, redirect guards
├── constants/       url.jsx — endpoints catalogue
├── hooks/           useDebounced, useFormAlert, useOutsideClick, useAutoClose, useAutoFocus
├── layout/          Header, Sidebar, Footer, ErrorBoundary, user + admin shells
├── modules/
│   ├── Auth/        login, register, forgot, OTP, reset, admin login
│   ├── Dashboard/   admin dashboard
│   ├── user/        Home, ProductList, ProductDetails, Cart, Checkout, Wishlist, Profile, Orders
│   └── admin/       Users, ProductTypes, Products, Orders
├── routes/          lazy imports + route config + guards
├── services/        api (axios + refresh interceptor), localStorage, sessionStorage, cookies
├── store/           Redux Toolkit (auth, common, cart, wishlist)
└── utils/           lazyLoad, format helpers
```

---

## 3 · Design system

**Theme** — matte black, white typography, glassmorphism, sparse luminous highlights, cinematic spacing.

**Tokens** live in `frontend/src/assets/scss/_tokens.scss` and are auto-injected into every SCSS partial via Vite's preprocessor config.

Type stack:
- Display — **Sora** (luxury display)
- Body — **Inter**
- Labels / mono — **Geist**

Component primitives (all in `_components.scss`):
- `aura-header` — floating glass pill nav
- `hero` — full-bleed editorial hero
- `product-card` — matte black card with hover-zoom imagery
- `stat-card`, `data-table`, `badge`, `chip` — admin primitives
- `aura-sidebar` — admin navigation column

---

## 4 · API surface

All endpoints are prefixed with `/api/v1`. Auth uses Bearer JWT (15-minute access tokens; 7-day refresh tokens, hashed at rest).

Key routes:

| Method | Path | Purpose |
|--|--|--|
| POST | `/auth/register` · `/auth/login` · `/auth/refresh` · `/auth/logout` | Session lifecycle |
| POST | `/auth/forgot-password` · `/auth/verify-otp` · `/auth/reset-password` | OTP-based recovery (OTP printed to backend log in dev) |
| GET/PATCH | `/users/me` | Profile |
| GET/POST/DELETE | `/users/me/addresses` | Saved addresses |
| GET | `/product-types` · `/product-types/active` | Public catalogue |
| GET | `/products` · `/products/slug/:slug` · `/products/:id/similar` | Public storefront |
| GET/POST/PATCH/DELETE | `/cart` · `/cart/items/:id` | Bag management (authenticated) |
| GET/POST/DELETE | `/wishlist` · `/wishlist/:productId` | Wishlist |
| POST | `/orders` | Place a COD order from the current cart |
| GET | `/orders/mine` · `/orders/mine/:id` | Customer order history |
| PATCH | `/orders/mine/:id/cancel` | Cancel before shipment |
| GET / PATCH (admin) | `/orders` · `/orders/:id/status` | Admin order ops |
| GET (admin) | `/admin/dashboard/overview` | KPI cards + breakdown |

Response envelope:
```json
{ "success": true, "message": "…", "data": <payload>, "meta": <pagination meta> }
```

---

## 5 · Security & ops

- Helmet, CORS, global rate limit (configurable via env)
- DTO validation everywhere (`class-validator`) + global ValidationPipe (whitelist + forbidNonWhitelisted)
- JWT with separate access / refresh secrets; refresh token hashed at rest
- Role-based access (`@Roles(Role.ADMIN)` + `RolesGuard`)
- Soft-delete on every entity (TypeORM `@DeleteDateColumn`)
- Stock decrement is transactional during order placement
- Frontend axios interceptor refreshes tokens transparently and redirects to login on hard failure
- All API responses pass through a `ResponseInterceptor` for a single envelope shape

---

## 6 · Production checklist

- [ ] Set `DB_SYNCHRONIZE=false` and run TypeORM migrations instead
- [ ] Replace OTP log output with transactional email (SES, Postmark, SendGrid)
- [ ] Move image uploads from URL pasting to a presigned-S3 flow (or Cloudinary)
- [ ] Add Sentry / OpenTelemetry instrumentation
- [ ] Run `npm audit` and pin lockfile in CI
- [ ] Configure CORS origin to the production frontend domain
- [ ] Bump throttle limits per environment

The architecture is intentionally modular — each NestJS module owns its entities, DTOs, service, controller, and module file; each frontend module owns its pages, components, constants, and slice. Adding a new category, payment provider, or commerce surface is a localised change.

— *AURA atelier · Engineered for the elite.*
