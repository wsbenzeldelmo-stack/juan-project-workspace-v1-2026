-- JUAN PROJECT WORKSPACE — Supabase RLS hardening baseline
-- Run in Supabase SQL Editor after creating/backing up tables.
alter table if exists public.clients enable row level security;
alter table if exists public.projects enable row level security;
alter table if exists public.payments enable row level security;
alter table if exists public.project_items enable row level security;
alter table if exists public.deliverables enable row level security;
-- Browser clients receive no Supabase key in this architecture. Revoke anon/authenticated table access.
revoke all on table public.clients, public.projects, public.payments, public.project_items, public.deliverables from anon, authenticated;
-- Serverless proxy uses service_role, which bypasses RLS by design; keep that key server-only.
