-- Phase 3: fixed and flexible tasks with immutable dated completion history.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  objective_id uuid references public.objectives(id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 160),
  description text check (description is null or char_length(description) <= 1000),
  task_type text not null check (task_type in ('fixed', 'flexible')),
  frequency_type text not null default 'daily',
  frequency_config jsonb not null default '{"days":[1,2,3,4,5,6,7]}'::jsonb,
  target_value numeric,
  target_unit text,
  scheduled_date date,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint flexible_task_requires_date check (task_type <> 'flexible' or scheduled_date is not null)
);

create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  completed boolean not null default false,
  completed_at timestamptz,
  value numeric,
  note text,
  created_at timestamptz not null default now(),
  unique (task_id, date)
);

create index if not exists tasks_user_active_sort_idx on public.tasks (user_id, is_active, sort_order);
create index if not exists task_completions_user_date_idx on public.task_completions (user_id, date);

alter table public.tasks enable row level security;
alter table public.task_completions enable row level security;

drop policy if exists "Users manage own tasks" on public.tasks;
create policy "Users manage own tasks" on public.tasks for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own task completions" on public.task_completions;
create policy "Users manage own task completions" on public.task_completions for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
