-- Phase 2: user objectives and first-login defaults.

create table if not exists public.objectives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  description text check (description is null or char_length(description) <= 280),
  icon text,
  color text,
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists objectives_user_active_sort_idx
  on public.objectives (user_id, is_archived, sort_order, created_at);

alter table public.objectives enable row level security;

drop policy if exists "Users can view their own objectives" on public.objectives;
drop policy if exists "Users can create their own objectives" on public.objectives;
drop policy if exists "Users can update their own objectives" on public.objectives;
drop policy if exists "Users can delete their own objectives" on public.objectives;

create policy "Users can view their own objectives"
  on public.objectives for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own objectives"
  on public.objectives for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own objectives"
  on public.objectives for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own objectives"
  on public.objectives for delete to authenticated
  using ((select auth.uid()) = user_id);

drop trigger if exists set_objectives_updated_at on public.objectives;
create trigger set_objectives_updated_at
  before update on public.objectives
  for each row execute function public.set_updated_at();

create or replace function public.seed_default_objectives(target_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.objectives (user_id, name, description, icon, color, sort_order)
  values
    (target_user_id, 'Healthy', 'Build energy through small, repeatable choices.', 'heart', '#ef6b73', 0),
    (target_user_id, 'Wealthy', 'Make steady progress toward financial freedom.', 'wallet', '#77b6ff', 1),
    (target_user_id, 'Happiness', 'Make room for what keeps life meaningful.', 'sparkles', '#b69cff', 2);
end;
$$;

create or replace function public.seed_new_user_objectives()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.seed_default_objectives(new.id);
  return new;
end;
$$;

drop trigger if exists on_user_profile_created_seed_objectives on public.users;
create trigger on_user_profile_created_seed_objectives
  after insert on public.users
  for each row execute function public.seed_new_user_objectives();

-- Bring existing profile rows forward once without touching anyone who already
-- created an objective.
do $$
declare
  profile_id uuid;
begin
  for profile_id in
    select u.id
    from public.users u
    where not exists (
      select 1 from public.objectives o where o.user_id = u.id
    )
  loop
    perform public.seed_default_objectives(profile_id);
  end loop;
end;
$$;
