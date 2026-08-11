# EMCORD Dashboard

Early-stage ops dashboard for the new digital twin / AR / MR / VR company.
Pipeline and Finance are both functional now on manual entry, with the data
shaped to match HubSpot deals and Xero invoices so those integrations can
be swapped in later without changing any page.

## 1. Create the Supabase project

1. Go to supabase.com → New project.
2. Once it's up, open **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and run it. This creates the `deals`, `invoices`,
   and `expenses` tables with permissive RLS (fine for a single internal
   user — tighten later once there's auth or multiple users).
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

## 2. Push to GitHub

Create a new repo and upload this project's contents via the GitHub web
interface (same workflow as the CCG dashboard) — no local dev environment
needed.

## 3. Deploy on Vercel

1. Import the repo into Vercel.
2. Framework preset: **Vite**.
3. Add environment variables (Project Settings → Environment Variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. Vercel rebuilds automatically on every push to the repo.

## What's in here

- **Overview** — top-line KPIs and pipeline-by-stage breakdown.
- **Sales** — add/edit/delete deals, filter by service type (Digital
  Twin / AR / MR / VR / Immersive Experience), inline stage changes.
- **Finance** — invoice entry (contact, amount, currency, status, dates)
  and a separate expenses ledger, with outstanding/paid/expenses totals
  grouped by currency.

## Data layer → future integrations

All reads/writes go through `src/lib/deals.js` and `src/lib/finance.js`.
`deals.js` is shaped to match a GoHighLevel (GHL) opportunity, and
`finance.js` invoices are shaped to match a Xero invoice. When you're
ready to connect those:

- Swap the function bodies in `deals.js` for GHL API calls (opportunities
  endpoint), and `finance.js` for Xero — same pattern as CCG's earlier
  GHL integration and the current `xero-*.mjs` handlers. No page component
  needs to change.
- One note specific to GHL: its pipeline stages are IDs scoped per-pipeline
  rather than a fixed global list, so the stage-label mapping (`STAGES` in
  `deals.js`) will need a lookup against GHL's pipeline config rather than
  a hardcoded array once that's wired in.
- Old manually-entered rows stay as historical record; they don't need to
  be migrated into GHL/Xero, they just stop being the active source going
  forward.

## Not built yet (fold in later, following the same order used on the CCG dashboard)

- Auth (currently open on the anon key — fine solo, needed once others use it)
- Revenue/FX rollups, YoY comparisons
- Delivery/capacity tracking
- Slack/Monday notifications
- P&L tab

## Local dev (optional)

```
npm install
cp .env.example .env.local   # fill in Supabase values
npm run dev
```
