-- Twin Ops Dashboard — initial schema
-- Run in Supabase SQL editor (Project > SQL Editor > New query)

create extension if not exists "pgcrypto";

-- ── Deals / Pipeline ─────────────────────────────────────────────
-- Field names mirror HubSpot's deal properties so a future migration
-- (hubspot-data.mjs style) maps cleanly.
create table if not exists deals (
  id              uuid primary key default gen_random_uuid(),
  company         text not null,
  contact_name    text,
  contact_email   text,
  service_type    text not null default 'Digital Twin',
  stage           text not null default 'New Lead',
  amount          numeric(14,2) default 0,
  currency        text not null default 'USD',
  expected_close  date,
  owner           text,
  source          text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_deals_stage on deals(stage);
create index if not exists idx_deals_service_type on deals(service_type);

-- ── Invoices ─────────────────────────────────────────────────────
-- Field names mirror Xero's Invoice object.
create table if not exists invoices (
  id              uuid primary key default gen_random_uuid(),
  contact         text not null,
  invoice_number  text,
  amount          numeric(14,2) not null default 0,
  currency        text not null default 'USD',
  status          text not null default 'Draft',
  issue_date      date not null default current_date,
  due_date        date,
  reference       text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_invoices_status on invoices(status);

-- ── Expenses ─────────────────────────────────────────────────────
create table if not exists expenses (
  id              uuid primary key default gen_random_uuid(),
  description     text not null,
  category        text not null default 'Other',
  amount          numeric(14,2) not null default 0,
  currency        text not null default 'USD',
  date            date not null default current_date,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────────
-- Starting point: permissive policies so the dashboard works with the
-- anon key for a single internal user. Tighten this once auth/multiple
-- users are added (e.g. scope by auth.uid() or a team_id column).
alter table deals enable row level security;
alter table invoices enable row level security;
alter table expenses enable row level security;

create policy "allow all on deals" on deals for all using (true) with check (true);
create policy "allow all on invoices" on invoices for all using (true) with check (true);
create policy "allow all on expenses" on expenses for all using (true) with check (true);
