-- Phase 4: flexible daily trackers and their dated entries.

create table if not exists public.trackers (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade,
  objective_id uuid references public.objectives(id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 120), description text,
  tracker_type text not null check (tracker_type in ('number','duration','time_range','boolean','counter','rating','currency','streak')),
  unit text, goal_value numeric, goal_config jsonb, icon text, color text,
  frequency text not null default 'daily', is_active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.tracker_entries (
  id uuid primary key default gen_random_uuid(), tracker_id uuid not null references public.trackers(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade, entry_date date not null,
  numeric_value numeric, boolean_value boolean, start_time time, end_time time, duration_minutes integer,
  rating_value integer, currency_value numeric, currency_code text, text_value text, note text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(tracker_id, entry_date)
);

create index if not exists trackers_user_active_sort_idx on public.trackers(user_id, is_active, sort_order);
create index if not exists tracker_entries_user_date_idx on public.tracker_entries(user_id, entry_date);
alter table public.trackers enable row level security; alter table public.tracker_entries enable row level security;
drop policy if exists "Users manage own trackers" on public.trackers;
create policy "Users manage own trackers" on public.trackers for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own tracker entries" on public.tracker_entries;
create policy "Users manage own tracker entries" on public.tracker_entries for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop trigger if exists set_trackers_updated_at on public.trackers;
create trigger set_trackers_updated_at before update on public.trackers for each row execute function public.set_updated_at();
drop trigger if exists set_tracker_entries_updated_at on public.tracker_entries;
create trigger set_tracker_entries_updated_at before update on public.tracker_entries for each row execute function public.set_updated_at();
