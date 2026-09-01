-- JUAN PROJECT WORKSPACE — fresh Supabase installation
-- Safe for a NEW Supabase project. Run once in SQL Editor before first cloud connection.
begin;

create table if not exists public.clients (
  id text primary key,
  client_number integer,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key,
  project_number integer,
  client_id text references public.clients(id) on update cascade on delete set null,
  client_name text not null default '',
  client_email text not null default '',
  client_phone text not null default '',
  client_address text not null default '',
  title text not null default '',
  status text not null default 'In Progress',
  delivery_status text not null default 'Pending',
  start_date date,
  deadline_date date,
  payment_due_date date,
  total_amount numeric(14,2) not null default 0 check (total_amount >= 0),
  subtotal_amount numeric(14,2) not null default 0 check (subtotal_amount >= 0),
  discount_amount numeric(14,2) not null default 0 check (discount_amount >= 0),
  rush_fee numeric(14,2) not null default 0 check (rush_fee >= 0),
  workload_rush_rate numeric(8,4) not null default 0 check (workload_rush_rate >= 0),
  workload_rush_fee numeric(14,2) not null default 0 check (workload_rush_fee >= 0),
  workload_at_booking integer not null default 0 check (workload_at_booking >= 0),
  rush_days_early integer not null default 0 check (rush_days_early >= 0),
  rush_base_fee numeric(14,2) not null default 0 check (rush_base_fee >= 0),
  rush_load_factor numeric(8,4) not null default 0 check (rush_load_factor >= 0),
  rush_project_workload integer not null default 0 check (rush_project_workload >= 0),
  system_maintenance_charge numeric(14,2) not null default 0 check (system_maintenance_charge >= 0),
  project_type text not null default '',
  priority boolean not null default false,
  notes text not null default '',
  deliverables jsonb not null default '[]'::jsonb,
  deadline_auto boolean not null default true,
  invoice_number text,
  invoice_issue_date date,
  invoice_due_date date,
  deleted boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_items (
  id text primary key,
  project_id text not null references public.projects(id) on update cascade on delete cascade,
  name text not null default '',
  qty numeric(10,2) not null default 1 check (qty > 0),
  price numeric(14,2) not null default 0 check (price >= 0),
  type text not null default 'SOLO',
  addon_type text,
  product_code text,
  source_product_code text,
  source_item_name text,
  category text not null default '',
  item_discount numeric(14,2) not null default 0 check (item_discount >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deliverables (
  id text primary key,
  project_id text not null references public.projects(id) on update cascade on delete cascade,
  name text not null default '',
  item_name text not null default '',
  status text not null default 'Pending',
  completed boolean not null default false,
  progress numeric(5,2) not null default 0 check (progress >= 0 and progress <= 100),
  parent_id text,
  is_group boolean not null default false,
  source_type text,
  order_item_id text,
  order_item_occurrence integer,
  package_name text,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id text primary key,
  project_id text not null references public.projects(id) on update cascade on delete cascade,
  amount_paid numeric(14,2) not null default 0 check (amount_paid >= 0),
  payment_date date,
  payment_method text not null default '',
  reference_no text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_client_id on public.projects(client_id);
create index if not exists idx_projects_created_at on public.projects(created_at desc);
create index if not exists idx_projects_deadline on public.projects(deadline_date);
create index if not exists idx_project_items_project_id on public.project_items(project_id);
create index if not exists idx_deliverables_project_id on public.deliverables(project_id);
create index if not exists idx_payments_project_id on public.payments(project_id);
create index if not exists idx_payments_payment_date on public.payments(payment_date desc);

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_items enable row level security;
alter table public.deliverables enable row level security;
alter table public.payments enable row level security;

revoke all on table public.clients, public.projects, public.project_items, public.deliverables, public.payments from anon, authenticated;

grant all on table public.clients, public.projects, public.project_items, public.deliverables, public.payments to service_role;

commit;
