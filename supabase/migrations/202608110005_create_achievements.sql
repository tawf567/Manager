create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade,
  objective_id uuid references public.objectives(id) on delete set null, title text not null check(char_length(trim(title)) between 1 and 160),
  description text, achievement_date date not null, achievement_type text not null default 'milestone' check(achievement_type in ('milestone','transformation','memory')),
  numeric_value numeric, unit text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.achievement_media (
  id uuid primary key default gen_random_uuid(), achievement_id uuid not null references public.achievements(id) on delete cascade,
  media_type text not null check(media_type in ('image','video')), file_url text not null, thumbnail_url text, caption text, sort_order integer not null default 0, created_at timestamptz not null default now()
);
alter table public.achievements enable row level security; alter table public.achievement_media enable row level security;
drop policy if exists "Users manage own achievements" on public.achievements;
create policy "Users manage own achievements" on public.achievements for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists "Users manage own achievement media" on public.achievement_media;
create policy "Users manage own achievement media" on public.achievement_media for all to authenticated using (exists(select 1 from public.achievements a where a.id=achievement_id and a.user_id=(select auth.uid()))) with check (exists(select 1 from public.achievements a where a.id=achievement_id and a.user_id=(select auth.uid())));
drop trigger if exists set_achievements_updated_at on public.achievements;
create trigger set_achievements_updated_at before update on public.achievements for each row execute function public.set_updated_at();
