"use client";

import { Archive, Pencil, Plus, Save, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/types/task";

type Draft = { name: string; taskType: "fixed" | "flexible"; scheduledDate: string };
const blank: Draft = {
  name: "",
  taskType: "fixed",
  scheduledDate: new Date().toISOString().slice(0, 10),
};

export function TasksManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState<Draft>(blank);
  const [editingId, setEditingId] = useState<string>();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string>();
  async function load() {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", auth.user.id)
      .eq("is_active", true)
      .order("sort_order");
    if (error) {
      setMessage("Couldn’t load tasks.");
      return;
    }
    setTasks((data as Task[] | null) ?? []);
  }
  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);
  function cancel() {
    setOpen(false);
    setEditingId(undefined);
    setDraft(blank);
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name) {
      setMessage("A task name is required.");
      return;
    }
    if (draft.taskType === "flexible" && !draft.scheduledDate) {
      setMessage("Choose a scheduled date.");
      return;
    }
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const values = {
      name,
      task_type: draft.taskType,
      scheduled_date: draft.taskType === "flexible" ? draft.scheduledDate : null,
      frequency_type: draft.taskType === "fixed" ? "daily" : "once",
    };
    const response = editingId
      ? await supabase
          .from("tasks")
          .update(values)
          .eq("id", editingId)
          .eq("user_id", auth.user.id)
      : await supabase
          .from("tasks")
          .insert({ ...values, user_id: auth.user.id, sort_order: tasks.length });
    if (response.error) {
      setMessage("Couldn’t save task.");
      return;
    }
    cancel();
    await load();
  }
  async function archive(task: Task) {
    const supabase = createClient();
    const { error } = await supabase
      .from("tasks")
      .update({ is_active: false })
      .eq("id", task.id)
      .eq("user_id", task.user_id);
    if (error) {
      setMessage("Couldn’t archive task.");
      return;
    }
    await load();
  }
  function edit(task: Task) {
    setEditingId(task.id);
    setDraft({
      name: task.name,
      taskType: task.task_type,
      scheduledDate: task.scheduled_date ?? new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  }
  return (
    <section
      aria-labelledby="tasks-settings-heading"
      className="border-border bg-card space-y-5 rounded-3xl border p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary text-xs font-bold tracking-[0.12em] uppercase">
            Planning
          </p>
          <h2 className="mt-1 font-semibold" id="tasks-settings-heading">
            Tasks
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Recurring habits and one-off tasks.
          </p>
        </div>
        <Button
          onClick={() => {
            setOpen(true);
            setEditingId(undefined);
            setDraft(blank);
          }}
          size="sm"
          type="button"
        >
          <Plus aria-hidden="true" className="size-4" /> Add task
        </Button>
      </div>
      {open ? (
        <form className="bg-secondary space-y-3 rounded-2xl p-4" onSubmit={save}>
          <input
            className="border-input bg-card focus:ring-ring h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2"
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            placeholder="Task name"
            value={draft.name}
          />
          <label className="text-muted-foreground block text-sm">
            Type
            <select
              className="border-input bg-card focus:ring-ring mt-1 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2"
              onChange={(event) =>
                setDraft({
                  ...draft,
                  taskType: event.target.value as Draft["taskType"],
                })
              }
              value={draft.taskType}
            >
              <option value="fixed">Fixed (daily)</option>
              <option value="flexible">Flexible (one date)</option>
            </select>
          </label>
          {draft.taskType === "flexible" ? (
            <label className="text-muted-foreground block text-sm">
              Scheduled date
              <input
                className="border-input bg-card focus:ring-ring mt-1 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2"
                onChange={(event) =>
                  setDraft({ ...draft, scheduledDate: event.target.value })
                }
                type="date"
                value={draft.scheduledDate}
              />
            </label>
          ) : null}
          <div className="flex gap-2">
            <Button size="sm" type="submit">
              <Save aria-hidden="true" className="size-4" /> Save
            </Button>
            <Button onClick={cancel} size="sm" type="button" variant="ghost">
              <X aria-hidden="true" className="size-4" /> Cancel
            </Button>
          </div>
        </form>
      ) : null}
      {message ? <p className="text-sm text-red-300">{message}</p> : null}
      <div className="space-y-2">
        {tasks.map((task) => (
          <article
            className="bg-secondary/70 flex items-center gap-3 rounded-2xl p-3"
            key={task.id}
          >
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium">{task.name}</h3>
              <p className="text-muted-foreground text-xs">
                {task.task_type === "fixed"
                  ? "Fixed daily"
                  : `Flexible · ${task.scheduled_date}`}
              </p>
            </div>
            <Button
              aria-label={`Edit ${task.name}`}
              onClick={() => edit(task)}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Pencil aria-hidden="true" className="size-4" />
            </Button>
            <Button
              aria-label={`Archive ${task.name}`}
              onClick={() => void archive(task)}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Archive aria-hidden="true" className="size-4" />
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
