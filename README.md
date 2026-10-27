# IK Hope Centre Orphanage — Donation & Fundraiser Platform

A mobile-first, responsive web app for a registered Kenyan orphanage. Visitors can
**donate** (M-PESA STK Push, Airtel Money, bank transfer with proof, card fallback) or
**start a fundraiser** that gets its own public page with a progress bar and share links.
A hidden, 2FA-protected **admin dashboard** manages contributions, verifies bank
transfers, approves campaigns and exports CSV/PDF.

## Quick start

```bash
cp .env.example .env        # configure a local PostgreSQL DATABASE_URL
npm install
npm run db:push             # create tables (schema in src/db/schema.ts)
npm run dev                 # or: npm run build && npm start
```

The app does not seed demo campaigns, donations, or admin accounts at runtime. To
remove demo records from an existing database, verify `DATABASE_URL` points to the
intended database and run `npm run db:remove-demo`. This deletes only known seeded
receipt/provider references and unused seeded campaign slugs; it preserves campaigns
that have donations. Create the first admin explicitly with `npm run db:provision-admin`
after setting `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a unique `ADMIN_TOTP_SECRET`.

## Payments

| Method | Provider | Live mode | Stub mode (no keys) |
|---|---|---|---|
| M-PESA | Safaricom **Daraja STK Push** | real OAuth + `/mpesa/stkpush/v1/processrequest` | simulated only outside production |
| Airtel Money | **Airtel Africa (Transact) API** | real `/v2/payments/request` + webhook | simulated collect |
| Bank transfer | — | proof upload → **admin verifies** | same |
| Card | **Flutterwave** (PayStack same shape) | real `/v3/charges` | simulated charge |

### Flow
Amount + currency → method → phone → STK/USSD prompt on handset → **provider calls back
to our server** → donation marked `confirmed` → receipt code on screen + emailed
e-receipt (SMTP) / SMS (planned).

### Security model (important)
- Payments are confirmed **only** by the server-to-server callback endpoints
  (`/api/payments/daraja/callback`, `/api/payments/airtel/callback`) or by the admin
  for bank transfers. The browser can never mark a payment confirmed.
- Daraja live callbacks require a private `DARAJA_CALLBACK_TOKEN` in the callback URL.
  Configure `DARAJA_CALLBACK_URL` with that token and register the URL with Safaricom.
- Every donation stores **KES amount + original currency + exact rate used**, with a
  full audit trail in the `transactions` table (init / callback / confirmed / admin).
- Public campaign pages show **aggregate totals only** — donor details are never
  rendered outside the admin surface, and proof files live outside `public/` and are
  served by an authenticated route.

## Admin

`/admin` (hidden — not in the nav; footer "Staff" link).
- **Auth**: email + bcrypt password → TOTP (or one-time recovery code) → 30-min
  DB-backed session (sliding, httpOnly cookie). Login + TOTP are rate-limited
  (6 / 8 attempts per 15 min per IP); admin POSTs additionally require same-origin
  headers (CSRF).
- **Dashboard**: overview stats · full donation register (filter/search, view proof,
  verify/reject bank transfers, send thank-you emails) · campaign approval ·
  CSV export (rate-limited 10/h) + client-generated PDF register.

## Currency

Header switcher (KES / USD / EUR / GBP). First visit auto-detects country
(`/api/geo`) and defaults Kenyan visitors to KES. Live rates from **exchangerate.host**
(`EXCHANGE_RATE_API_KEY` optional; free fallback `open.er-api.com`), cached 5 min
server-side; the **server re-computes KES at payment time** — the client display is
never trusted.

## Project structure

```
src/
  app/
    page.tsx                    Home (hero, stats, featured campaigns, testimonials)
    about/ programs/ contact/   content pages
    donate/                     donation page
    fundraisers/new/            start-a-fundraiser
    campaigns/ + [slug]/        listing + public campaign page (aggregate only)
    admin/ + admin/login/       hidden dashboard + 2FA login
    api/
      auth/                     login (pwd) · verify (TOTP) · session · logout
      donations/                POST initiate · [receiptCode]/status poll
      payments/daraja|airtel/   provider callbacks (server-side verification)
      campaigns/ contact/ rates/ geo/
      admin/                    overview · donations (+actions) · campaigns
                                (+approve/reject) · export · proof
  components/                   header, footer, sticky-donate, donate-flow,
                                admin dashboard, share, ui primitives
  lib/
    payments/                   daraja.ts · airtel.ts · card.ts (live + stub)
    auth.ts                     bcrypt · TOTP (RFC 6238) · sessions · CSRF guard
    rates.ts                    FX fetch + 5-min cache + fallbacks
    donations.ts                idempotent server-side confirmation
    receipt.ts                  email receipts + thank-you (nodemailer)
    campaigns.ts                aggregate campaign and donation totals
  db/
    schema.ts                   Drizzle schema: admins, sessions, campaigns,
                                donations, transactions, contact_messages
```

## Production Deployment

GitHub stores the source; it does not host this server-side Next.js application.
Connect the repository to Vercel (or another Next.js host) for builds and live hosting.
Provision managed PostgreSQL (for example, Neon, Supabase, or RDS), set the environment
variables in the hosting dashboard, and deploy from the GitHub repository. Set
`DATABASE_URL`, `NEXT_PUBLIC_BASE_URL`, `ADMIN_HMAC_SECRET` (32+ random characters),
`ADMIN_EMAIL`, `ADMIN_PASSWORD` (16+ characters), and a unique `ADMIN_TOTP_SECRET`.

Before opening donations, run `npm run db:push`, run `npm run db:provision-admin` once
against the production database, and run `npm run db:remove-demo` if that database ever
contained seeded data. For live M-PESA, enter the Consumer Key and Consumer Secret from
your **production** Daraja app, plus the matching production shortcode and passkey from
Safaricom. Set `DARAJA_BASE_URL=https://api.safaricom.co.ke` and configure
`DARAJA_CALLBACK_TOKEN` plus the matching public HTTPS `DARAJA_CALLBACK_URL`; register
that exact callback URL in the Daraja portal. Sandbox credentials must use
`https://sandbox.safaricom.co.ke` and are not interchangeable with production values.

Configure SMTP and provider credentials only when those payment/receipt methods are
ready. Production M-PESA fails closed when Daraja is not configured; other payment
providers may still have their own sandbox fallbacks. Before launch, also move uploaded
proof files to durable private object storage and replace the in-memory rate limiter if
you deploy multiple instances. Vercel's Git integration can deploy on pushes to the
selected branch; use the resulting HTTPS domain for public and callback URLs.

## Notes on the requested stack

- **ORM**: the sandbox mandates **Drizzle ORM** over Prisma — the schema maps 1:1 to
  the requested tables (`admins`, `sessions`, `campaigns`, `donations`,
  `transactions`, `contact_messages`).
- **Auth**: self-contained session auth with bcrypt + TOTP 2FA (NextAuth/Clerk need
  external accounts; this keeps 2FA + rate limiting fully in your control).
- **UI**: hand-rolled Tailwind v4 components following shadcn's design language
  (neutral surfaces, one accent, accessible focus states).
- **i18n**: ships English; `src/lib/i18n.ts` contains the Swahili dictionary and a
  `t()` helper ready for a locale toggle.
