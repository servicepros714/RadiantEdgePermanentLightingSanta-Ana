# RadiantEdge Permanent Lighting — Santa Ana

Vite + React site with a 6-step booking flow, Cloudflare Worker + D1 booking API, and a $149 Stripe reservation deposit.

| Plumbing | Value |
|---|---|
| Source tag | `radiantedge-santaana` |
| Booking ID prefix | `RE-` (e.g. `RE-261105-7KQ2`) |
| Worker | `radiantedge-santaana-api` |
| Pages project | `radiantedge-permanent-lighting-santa-ana` |
| GitHub repo | `servicepros714/radiantedge-permanent-lighting-santa-ana` |

## 1. Edit content

Everything editable is in `src/config/site.js`: phone, prices (`null` = "Online quoting"), add-ons, cities, FAQ, takedown timing, gallery.

TODOs before launch:
- Starting prices, if you want them shown instead of "Online quoting".
- Confirm the service-area city list and takedown timing.
- Real Google reviews → `REVIEWS` (the placeholder panel disappears automatically). Add the GBP review link to `BUSINESS.googleReviewUrl`.
- Real install photos → `GALLERY[].photo` (put files in `public/images/gallery/`). Until then the gallery shows illustrated scenes tagged "Design preview".
- Live domain → replace the `pages.dev` URLs in `index.html`, `public/robots.txt` and `public/sitemap.xml`.

## 2. Run locally (Windows CMD)

```
cd radiantedge-permanent-lighting-santa-ana
npm install
npm run dev
```

`.env.local` holds `VITE_STRIPE_PUBLISHABLE_KEY` and `VITE_API_BASE` (your Worker URL, no trailing slash).

## 3. Push to GitHub (Windows CMD)

```
cd radiantedge-permanent-lighting-santa-ana
git init
git add .
git commit -m "RadiantEdge Santa Ana site"
git branch -M main
git remote add origin https://github.com/servicepros714/radiantedge-permanent-lighting-santa-ana.git
git push -u origin main
```

## 4. Cloudflare (dashboard only)

**D1** — use the shared bookings database. Open it → Console → paste `worker/schema.sql` → Execute. It is safe to re-run.

**Worker** — Workers & Pages → Create → Worker → name it `radiantedge-santaana-api` → Edit code → paste `worker/worker.js` → Deploy. Then:
- Settings → Bindings → Add → D1 database → variable name `DB` → choose the shared database.
- Settings → Variables and Secrets → add **Secret** `STRIPE_SECRET_KEY`.
- Optional: `ADMIN_TOKEN` (secret). GET/PATCH `/api/bookings` stay closed until it is set, then require `Authorization: Bearer <token>`.
- Optional: `ALLOWED_ORIGIN` (your live domain). Defaults to `*`.
- Copy the Worker URL — that is `VITE_API_BASE`.

**Pages** — Workers & Pages → Create → Pages → Upload assets (Direct Upload) → name it `radiantedge-permanent-lighting-santa-ana` → upload any placeholder folder once to create the project. The GitHub Action deploys into it from then on.

**GitHub repo secrets** (Settings → Secrets and variables → Actions):
- `CLOUDFLARE_API_TOKEN` — a token with Cloudflare Pages: Edit
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_STRIPE_PUBLISHABLE_KEY` and `VITE_API_BASE` (optional; when set they override `.env.local`)

Every push to `main` builds and deploys. `public/_redirects` (`/* /index.html 200`) makes `/book`, `/checkout` and `/confirmation` load on refresh.

## 5. Stripe

- Settings → Payment methods: turn on cards plus Apple Pay / Google Pay / Link as wanted (automatic payment methods).
- Settings → Payment method domains: add the live domain and the `pages.dev` domain so the express buttons show.
- Test card: `4242 4242 4242 4242`, any future date, any CVC.

## Booking flow

1. Lighting type: Permanent / Seasonal
2. Package: Front Only / Front & Sides
3. Home height (1-Story / 2-Story +50%) + add-ons. Off-season storage is hidden for Permanent.
4. Install date: Oct 20 – Dec 20, every day, Pacific time (DST-aware)
5. Time window: `8AM–12PM` / `12PM–4PM`. Earliest window is 48 hours after current California time.
6. Your info: Full Name, Phone, Email, Service Address

Checkout: $149 Stripe deposit applied to the final invoice, or the plain "I'll pay at the visit" link (`payment_status = 'Pay Later'`). Add-ons picked on the homepage switchboard carry into booking.

## Stored values (shared D1 columns, no new columns)

| Column | Example |
|---|---|
| `id` | `RE-261030-S8DL` |
| `date` / `time` | `2026-11-05` / `12PM–4PM` (en dash) |
| `service` | `Front & Sides` |
| `vehicle` | `Seasonal · 2-Story · Front & Sides · +Wreaths` |
| `notes` | `Type: Seasonal \| Add-ons: Wreaths \| Estimate: Online quoting \| Deposit: $149 paid \| PI: pi_… \| Ref: RER-…` |
| `source` | `radiantedge-santaana` |
| `status` | `Booked` |
| `payment_status` | `Paid` or `Pay Later` |

PATCHABLE: `status, reschedule_date, reschedule_time, notes2, original_date, original_time, payment_status, date, time`.

## Worker API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/availability?date=YYYY-MM-DD` | Unavailable windows that day (source-scoped, includes the 48-hour lead) |
| GET | `/api/availability?from=&to=` | Dates with no window left |
| POST | `/api/create-payment-intent` | $149 PaymentIntent, `automatic_payment_methods`, idempotent per draft. Never touches D1 |
| POST | `/api/bookings` | `Paid` is verified with Stripe first. Same PaymentIntent or draft ref never makes two rows. Pay Later on a taken slot → 409. A paid booking that loses a slot race is saved and flagged `SLOT CONFLICT` in notes |
| GET | `/api/bookings` | Admin list (needs `ADMIN_TOKEN`) |
| PATCH | `/api/bookings/:id` | Admin update of PATCHABLE fields (needs `ADMIN_TOKEN`) |

A rescheduled booking holds its `reschedule_date` / `reschedule_time` slot. Cancelled bookings free their slot.

## Known recurring bugs — fixed in this build

- **ensureSchema blocking payment** — the payment-intent route never calls D1; schema setup is memoized and its errors are caught.
- **`.exec()` newline parsing** — no `exec()`; each statement is a single-line `prepare().run()`.
- **Nav grid mismatch** — the nav is flex; no grid columns to mismatch.
- **`.btn` background** — base `.btn` resets appearance, border and background; every variant sets its own.
- **`.container` specificity** — defined once as a single class, never compounded with section classes.
- **ExpressCheckoutElement clientSecret** — `<Elements>` mounts only after the PaymentIntent exists, keyed on its clientSecret.
- **`strong` display bleed** — `strong, b { display: inline }` in `base.css`; components never set display on `strong`.
