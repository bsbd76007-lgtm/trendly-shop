# Trendly Shop

React + TypeScript + Tailwind CSS frontend, Express + TypeScript backend, shared types.

## Run (two terminals, Node 23.6+, PostgreSQL 15+)

First time only:

```bash
createdb trendly                              # or any Postgres you have
cp user/api/.env.example user/api/.env        # then fill in DATABASE_URL and the rest
cd user/api && npm install && npm run db:migrate
npm run db:import                             # optional: copy the old JSON data into Postgres
```

Every day:

```bash
cd user/api && npm run dev   # http://localhost:4000
cd user/web && npm run dev   # http://localhost:3000  ← open this
```

Database scripts (in `user/api`): `db:migrate` (apply migrations), `db:migrate:dev` (after editing
`prisma/schema.prisma`, creates a new migration), `db:generate` (regenerate the client), `db:studio`
(browse the data), `db:import` (import `data/*.json`, safe to run again).

Admin panel: http://localhost:3000/admin — password in `api/.env` (`ADMIN_PASSWORD=…`, 8+ characters).
Without `.env` the API prints a temporary password on start.
The password can be changed in admin → Settings → Admin password (stored hashed in the `AdminAuth` table;
from then on `ADMIN_PASSWORD` is ignored). Forgot it? Run `DELETE FROM "AdminAuth";` in the database and
`ADMIN_PASSWORD` works again.

Other scripts: `npm run typecheck` (both), `npm run build` / `npm run preview` (web).

## Structure

```
user/
├── shared/                 types and constants used by api and web
│   ├── types.ts
│   └── constants.ts
├── api/                    Express, runs .ts directly with Node (no build step)
│   ├── prisma/             schema.prisma and SQL migrations (PostgreSQL)
│   ├── prisma.config.ts    Prisma CLI config (reads DATABASE_URL from .env)
│   ├── scripts/            import-json.ts: one-time import of the old JSON data
│   ├── data/receipts/      payment screenshots (private, served only to the admin)
│   ├── uploads/            photos uploaded from the admin panel
│   └── src/
│       ├── index.ts        starts the server
│       ├── app.ts          express app, routes, error handler
│       ├── config/         env: database, admin password, auth secret, Google, SMTP
│       ├── db/             Prisma client and row ↔ API type mappers
│       ├── generated/      Prisma client (generated, git-ignored)
│       ├── lib/            errors, text helpers, rate limit
│       ├── middleware/     admin auth, customer sessions, JSON-only guard
│       ├── validation/     input parsing for products, settings, orders, reviews
│       ├── services/       catalog, orders, payments, reviews, support chat, users, mail, stats, uploads
│       └── routes/         public, auth, payment/tracking, support and admin API
└── web/                    Vite + React + Tailwind
    ├── public/assets/      images shipped with the site
    └── src/
        ├── main.tsx, app/  entry and router
        ├── styles/         Tailwind theme (colors, font)
        ├── i18n/           translations hy / ru / en and the language provider
        ├── content/        About, FAQ, Privacy texts
        ├── state/          shop data, cart, toasts
        ├── hooks/          auto-hiding header, scroll to #hash
        ├── lib/            HTTP, API client, formatting, links, storage, image resize
        ├── components/     layout (header, footer) and UI (buttons, fields, logo, icons)
        ├── features/       home sections, catalog, cart and checkout, reviews, account forms
        ├── pages/          home, about, faq, privacy, account, not found
        └── admin/          admin panel: layout, pages, components, API client
```

## Where to change things
- Products, prices, photos, Instagram block, contacts, delivery fee, sizes: admin panel.
- Interface text: `web/src/i18n/messages/{hy,ru,en}.ts` (TypeScript checks all three have the same keys).
- About / FAQ / Privacy: `web/src/content/`.
- Colors and font: `web/src/styles/index.css` (`@theme`).

## Public API
- `GET /api/shop` — settings + visible products + Instagram posts
- `GET /api/products`, `GET /api/products/:id`, `GET /api/config`, `GET /api/instagram`
- `POST /api/orders` — prices recalculated on the server; hidden or unpriced products are rejected
- `GET /api/reviews` (approved only), `POST /api/reviews` (waits for approval)

## Accounts, email, payments
- Email + password and Google sign-in (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, redirect URI
  `APP_URL/api/auth/google/callback`). Sessions are signed cookies (`AUTH_SECRET`).
- Emails via nodemailer (`SMTP_*`, `MAIL_FROM`); shop alerts go to `ADMIN_EMAIL`. Without SMTP the API
  logs each email instead of sending it.
- Checkout → `/pay/:id` (card transfer, cards set in admin Settings) → `/track/:id` (live status).

## Before going live
- Run behind HTTPS (the admin cookie becomes Secure automatically).
- Use a long admin password.
- Back up the Postgres database (`pg_dump trendly > backup.sql`), `api/uploads/` and `api/data/receipts/`.
- Set `APP_URL`, `AUTH_SECRET` and the Google redirect URI to the live address.

## Deploy (Render + Vercel + Neon)
- **Database:** Neon Postgres. Its connection string goes into Render as `DATABASE_URL`.
- **API → Render** web service, root directory `user/api`, build `npm ci && npm run db:migrate`, start
  `npm start`, health check `/healthz`. Env: `DATABASE_URL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `APP_URL`
  (the Vercel address), `TRUST_PROXY=true`, `NODE_VERSION=24`, plus Google/SMTP if used.
- **Web → Vercel**, root directory `user/web` (Vite preset). `web/vercel.json` forwards `/api/*` and
  `/uploads/*` to the Render service, so the browser sees one site and the login cookies keep working.
  If the Render address changes, update it there.
- Uploaded photos and payment receipts are stored in Postgres (table `StoredFile`), not on disk, so
  they survive Render restarts.
