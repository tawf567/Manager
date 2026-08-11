"use client";

import { format } from "date-fns";
import { Check, Plus } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskCompletion } from "@/types/task";

const today = () => format(new Date(), "yyyy-MM-dd");

export function TodayTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string>();

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
    const visible = ((allTasks as Task[] | null) ?? []).filter(
      (task) => task.task_type === "fixed" || task.scheduled_date === date,
    );
    setTasks(visible);
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
    <section aria-labelledby="tasks-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" id="tasks-heading">
          Today’s tasks
        </h2>
        <span className="text-muted-foreground text-sm">
          {completed.size}/{tasks.length} done
        </span>
      </div>
      <form className="flex gap-2" onSubmit={addFlexible}>
        <input
          className="border-input bg-card h-11 min-w-0 flex-1 rounded-xl border px-3 text-sm"
          onChange={(event) => setName(event.target.value)}
          placeholder="Add a task for today"
          value={name}
        />
        <Button aria-label="Add flexible task" size="icon" type="submit">
          <Plus aria-hidden="true" className="size-5" />
        </Button>
      </form>
      {message ? <p className="text-sm text-red-300">{message}</p> : null}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="border-border bg-secondary/40 text-muted-foreground rounded-2xl border border-dashed p-5 text-sm">
            No tasks scheduled. Add one above or manage recurring tasks in Settings.
          </p>
        ) : (
          tasks.map((task) => {
            const done = completed.has(task.id);
            return (
              <button
                className="border-border bg-card flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 text-left"
                key={task.id}
                onClick={() => void toggle(task)}
                type="button"
              >
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-md border ${done ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}
                >
                  {done ? <Check aria-hidden="true" className="size-4" /> : null}
                </span>
                <span className={done ? "text-muted-foreground line-through" : ""}>
                  {task.name}
                </span>
                <span className="text-muted-foreground ml-auto text-xs capitalize">
                  {task.task_type}
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
