-- Phase 6: priority and optional due-time metadata for the task command center.

alter table public.tasks
  add column if not exists priority text not null default 'medium',
  add column if not exists due_time time;

alter table public.tasks
  drop constraint if exists tasks_priority_check;

alter table public.tasks
  add constraint tasks_priority_check
  check (priority in ('urgent', 'high', 'medium', 'low'));

create index if not exists tasks_user_agenda_idx
  on public.tasks (user_id, is_active, scheduled_date, due_time, priority, sort_order);
