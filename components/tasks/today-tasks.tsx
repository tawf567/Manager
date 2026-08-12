"use client";

import { format } from "date-fns";
import { AlarmClock, ArrowRight, Check, ListTodo, Plus } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskCompletion } from "@/types/task";

const today = () => format(new Date(), "yyyy-MM-dd");

export function TodayTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [upcomingTask, setUpcomingTask] = useState<Task>();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string>();
  const completeCount = completed.size;
  const progress = tasks.length ? Math.round((completeCount / tasks.length) * 100) : 0;

  async function load() {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const date = today();
    const [{ data: allTasks }, { data: completions }] = await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", auth.user.id)
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("task_completions")
        .select("task_id,date,completed")
        .eq("user_id", auth.user.id)
        .eq("date", date),
    ]);
    const storedTasks = (allTasks as Task[] | null) ?? [];
    const visible = storedTasks.filter(
      (task) => task.task_type === "fixed" || task.scheduled_date === date,
    );
    const nextTask = storedTasks
      .filter(
        (task) =>
          task.task_type === "flexible" &&
          task.scheduled_date !== null &&
          task.scheduled_date > date,
      )
      .sort((first, second) =>
        (first.scheduled_date ?? "").localeCompare(second.scheduled_date ?? ""),
      )[0];
    setTasks(visible);
    setUpcomingTask(nextTask);
    setCompleted(
      new Set(
        ((completions as TaskCompletion[] | null) ?? [])
          .filter((item) => item.completed)
          .map((item) => item.task_id),
      ),
    );
  }
  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);

  async function toggle(task: Task) {
    const next = !completed.has(task.id);
    setCompleted((current) => {
      const updated = new Set(current);
      if (next) updated.add(task.id);
      else updated.delete(task.id);
      return updated;
    });
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase.from("task_completions").upsert(
      {
        task_id: task.id,
        user_id: auth.user.id,
        date: today(),
        completed: next,
        completed_at: next ? new Date().toISOString() : null,
      },
      { onConflict: "task_id,date" },
    );
    if (error) {
      setMessage("Couldn’t save completion. Please try again.");
      await load();
    }
  }

  async function addFlexible(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase.from("tasks").insert({
      user_id: auth.user.id,
      name: trimmed,
      task_type: "flexible",
      scheduled_date: today(),
      sort_order: tasks.length,
    });
    if (error) {
      setMessage("Couldn’t add task. Please try again.");
      return;
    }
    setName("");
    await load();
  }

  return (
    <section aria-labelledby="tasks-heading" className="space-y-5">
      {upcomingTask?.scheduled_date ? (
        <aside className="border-primary/25 from-primary/20 via-card to-card relative overflow-hidden rounded-3xl border bg-gradient-to-br p-5 shadow-[0_14px_32px_rgba(0,0,0,0.22)] sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div className="relative flex gap-4">
            <span className="bg-primary text-primary-foreground grid size-11 shrink-0 place-items-center rounded-2xl shadow-sm">
              <AlarmClock aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-primary text-xs font-bold tracking-[0.12em] uppercase">
                Up next
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em]">
                {upcomingTask.name}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {format(
                  new Date(`${upcomingTask.scheduled_date}T00:00:00`),
                  "EEEE, MMMM d",
                )}
              </p>
            </div>
          </div>
          <Link
            className="text-primary hover:text-primary/80 mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold sm:mt-0"
            href="/settings"
          >
            Manage tasks <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </aside>
      ) : null}
      <div className="border-border bg-card overflow-hidden rounded-3xl border p-5 shadow-[0_12px_30px_rgba(57,54,47,0.05)] sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-primary flex items-center gap-2 text-xs font-bold tracking-[0.12em] uppercase">
              <ListTodo aria-hidden="true" className="size-3.5" /> Today’s focus
            </p>
            <h2
              className="mt-2 text-2xl font-semibold tracking-[-0.03em]"
              id="tasks-heading"
            >
              {tasks.length === 0
                ? "A clear day ahead"
                : completeCount === tasks.length
                  ? "Everything is complete"
                  : "One task at a time"}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {tasks.length === 0
                ? "Add the first thing you want to make progress on."
                : `${completeCount} of ${tasks.length} tasks complete`}
            </p>
          </div>
          <div className="bg-secondary flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl">
            <span className="text-xl font-bold tracking-[-0.04em]">{progress}%</span>
            <span className="text-muted-foreground text-[10px] font-bold tracking-[0.1em] uppercase">
              done
            </span>
          </div>
        </div>
        <div
          className="bg-muted mt-6 h-2 overflow-hidden rounded-full"
          role="progressbar"
          aria-label="Today’s task completion"
          aria-valuemax={tasks.length}
          aria-valuemin={0}
          aria-valuenow={completeCount}
        >
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form
        className="border-border bg-card flex gap-2 rounded-2xl border p-2 shadow-sm"
        onSubmit={addFlexible}
      >
        <input
          aria-label="Add a task for today"
          className="placeholder:text-muted-foreground min-w-0 flex-1 rounded-xl bg-transparent px-3 text-sm outline-none"
          onChange={(event) => setName(event.target.value)}
          placeholder="Add a task for today"
          value={name}
        />
        <Button aria-label="Add task" size="icon" type="submit">
          <Plus aria-hidden="true" className="size-5" />
        </Button>
      </form>
      {message ? <p className="text-sm text-red-300">{message}</p> : null}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="border-border bg-card text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm leading-6">
            Add a task above, or create a recurring habit in Settings.
          </p>
        ) : (
          tasks.map((task) => {
            const done = completed.has(task.id);
            return (
              <button
                className={`border-border bg-card flex min-h-16 w-full items-center gap-3 rounded-2xl border px-4 text-left shadow-sm transition-all hover:-translate-y-px hover:shadow-md ${done ? "opacity-70" : ""}`}
                key={task.id}
                onClick={() => void toggle(task)}
                type="button"
              >
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full border transition-colors ${done ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"}`}
                >
                  {done ? <Check aria-hidden="true" className="size-4" /> : null}
                </span>
                <span
                  className={`font-medium ${done ? "text-muted-foreground line-through" : ""}`}
                >
                  {task.name}
                </span>
                <span className="text-muted-foreground ml-auto text-xs">
                  {task.task_type === "fixed" ? "Daily" : "Today"}
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
