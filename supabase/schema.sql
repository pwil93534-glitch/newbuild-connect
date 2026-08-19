-- NewBuild Connect — Supabase Database Schema
-- Run this in your Supabase SQL Editor at: supabase.com → project → SQL Editor → New query

-- ───────────────────────────────────────────────
-- 1. Enable UUID support
-- ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ───────────────────────────────────────────────
-- 2. Buyer profiles (linked to Supabase Auth users)
-- ───────────────────────────────────────────────
create table public.buyers (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  phone text,
  buyer_type text check (buyer_type in ('veteran', 'first_time', 'senior', 'relocation')),
  military_base text,
  budget_min integer,
  budget_max integer,
  timeline text,
  loan_type text,
  has_agent boolean default true,
  is_onboarded boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.buyers enable row level security;

create policy "Buyers: select own" on public.buyers
  for select using (auth.uid() = id);

create policy "Buyers: insert own" on public.buyers
  for insert with check (auth.uid() = id);

create policy "Buyers: update own" on public.buyers
  for update using (auth.uid() = id);

-- ───────────────────────────────────────────────
-- 3. Saved communities
-- ───────────────────────────────────────────────
create table public.saved_communities (
  id uuid default uuid_generate_v4() primary key,
  buyer_id uuid references public.buyers(id) on delete cascade not null,
  community_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(buyer_id, community_id)
);

alter table public.saved_communities enable row level security;

create policy "SavedCommunities: all own" on public.saved_communities
  using (auth.uid() = buyer_id) with check (auth.uid() = buyer_id);

-- ───────────────────────────────────────────────
-- 4. AI Advisor chat messages
-- ───────────────────────────────────────────────
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  buyer_id uuid references public.buyers(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

create policy "Messages: all own" on public.messages
  using (auth.uid() = buyer_id) with check (auth.uid() = buyer_id);

-- ───────────────────────────────────────────────
-- 5. Journey task completions
-- ───────────────────────────────────────────────
create table public.task_completions (
  id uuid default uuid_generate_v4() primary key,
  buyer_id uuid references public.buyers(id) on delete cascade not null,
  task_key text not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(buyer_id, task_key)
);

alter table public.task_completions enable row level security;

create policy "TaskCompletions: all own" on public.task_completions
  using (auth.uid() = buyer_id) with check (auth.uid() = buyer_id);

-- ───────────────────────────────────────────────
-- 6. Auto-create buyer profile on sign-up
-- ───────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.buyers (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ───────────────────────────────────────────────
-- 7. Auto-update the updated_at timestamp
-- ───────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger buyers_updated_at
  before update on public.buyers
  for each row execute procedure public.handle_updated_at();
