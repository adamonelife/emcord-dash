-- EMCORD Dashboard — application schema
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

-- ── Projects / Delivery ──────────────────────────────────────────
-- Projects are owned by EMCORD. ghl_opportunity_id is an optional link
-- back to the sales system for future won-opportunity automation.
create table if not exists projects (
  id                      uuid primary key default gen_random_uuid(),
  project_name            text not null,
  client_company          text not null,
  primary_contact         text,
  service_type            text not null default 'Digital Twin'
                            check (service_type in ('Digital Twin', 'AR', 'MR', 'VR', 'Immersive Experience')),
  project_value           numeric(14,2) not null default 0 check (project_value >= 0),
  currency                text not null default 'USD',
  project_owner           text not null,
  status                  text not null default 'Not Started'
                            check (status in ('Not Started', 'In Progress', 'On Hold', 'At Risk', 'Completed', 'Cancelled')),
  start_date              date,
  target_completion_date  date,
  progress_percentage     integer not null default 0 check (progress_percentage between 0 and 100),
  priority                text not null default 'Normal'
                            check (priority in ('Low', 'Normal', 'High', 'Critical')),
  description             text,
  ghl_opportunity_id      text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (target_completion_date is null or start_date is null or target_completion_date >= start_date)
);

create index if not exists idx_projects_status on projects(status);
create index if not exists idx_projects_service_type on projects(service_type);
create index if not exists idx_projects_owner on projects(project_owner);
create index if not exists idx_projects_target_date on projects(target_completion_date);
create index if not exists idx_projects_ghl_opportunity on projects(ghl_opportunity_id)
  where ghl_opportunity_id is not null;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_projects_updated_at on projects;
create trigger set_projects_updated_at
before update on projects
for each row execute function set_updated_at();

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
alter table projects enable row level security;

create policy "allow all on deals" on deals for all using (true) with check (true);
create policy "allow all on invoices" on invoices for all using (true) with check (true);
create policy "allow all on expenses" on expenses for all using (true) with check (true);
create policy "allow all on projects" on projects for all using (true) with check (true);
