-- EMCORD Projects V1
-- Run this once in Supabase SQL Editor for an existing dashboard database.

create extension if not exists "pgcrypto";

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

alter table projects enable row level security;

drop policy if exists "allow all on projects" on projects;
create policy "allow all on projects"
on projects for all
using (true)
with check (true);
