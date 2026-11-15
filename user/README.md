# Trendly Shop

React + TypeScript + Tailwind CSS frontend, Express + TypeScript backend, shared types.

## Run (two terminals, Node 23.6+)

```bash
cd user/api && npm install && npm run dev   # http://localhost:4000
cd user/web && npm install && npm run dev   # http://localhost:3000  ← open this
```

Admin panel: http://localhost:3000/admin — password in `api/.env` (`ADMIN_PASSWORD=…`, 8+ characters).
Without `.env` the API prints a temporary password on start.

Other scripts: `npm run typecheck` (both), `npm run build` / `npm run preview` (web).

## Structure

```
user/
├── shared/                 types and constants used by api and web
│   ├── types.ts
│   └── constants.ts
├── api/                    Express, runs .ts directly with Node (no build step)
│   ├── data/               products, instagram, settings, reviews, orders (JSON)
│   ├── uploads/            photos uploaded from the admin panel
│   └── src/
│       ├── index.ts        starts the server
│       ├── app.ts          express app, routes, error handler
│       ├── config/         env, paths, admin password
│       ├── lib/            JSON store, errors, text helpers
│       ├── middleware/     admin auth, JSON-only guard
│       ├── validation/     input parsing for products, settings, orders, reviews
│       ├── services/       catalog, orders, reviews, stats, uploads
│       └── routes/         public API and admin API
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

## Sign in / sign up
`/account` is UI only. To connect real accounts, wire the submit handlers and the Google button in
`web/src/features/account/AuthForms.tsx`, add the auth endpoints in `api/src/routes`, then apply the
15% first-order discount in `api/src/services/orders.ts`.

## Before going live
- Run behind HTTPS (the admin cookie becomes Secure automatically).
- Use a long admin password.
- Back up `api/data/` and `api/uploads/` (both are git-ignored where they hold customer data).
