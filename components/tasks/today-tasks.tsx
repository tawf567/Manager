"use client";

import { format } from "date-fns";
import {
  Check,
  ChevronDown,
  Circle,
  Clock3,
  Flame,
  Plus,
  Sparkles,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { type Task, type TaskCompletion, type TaskPriority } from "@/types/task";

const priorityRank: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};
const priorityStyles: Record<TaskPriority, string> = {
  urgent: "bg-[#ffe0dc] text-[#aa3d38]",
  high: "bg-[#ffeab5] text-[#8b5a08]",
  medium: "bg-[#e6e1ff] text-[#5545b8]",
  low: "bg-[#daf3eb] text-[#247760]",
};
const taskTones = [
  "bg-[#efe9ff] text-[#5545b8]",
  "bg-[#ffe7bc] text-[#9b6700]",
  "bg-[#dbf3ea] text-[#267965]",
  "bg-[#ffe1e9] text-[#af4a6f]",
];
const taskEmoji = ["✦", "☀", "●", "✿"];
const today = () => format(new Date(), "yyyy-MM-dd");

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((first, second) => {
    const firstTime = first.due_time ?? "99:99";
    const secondTime = second.due_time ?? "99:99";
    return (
      priorityRank[first.priority ?? "medium"] -
        priorityRank[second.priority ?? "medium"] ||
      firstTime.localeCompare(secondTime) ||
      first.sort_order - second.sort_order
    );
  });
}

function formatDueTime(time: string | null) {
  if (!time) return "Any time";
  return format(new Date(`2000-01-01T${time}`), "h:mm a");
}

export function TodayTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [showCompleted, setShowCompleted] = useState(false);
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
    setTasks((allTasks as Task[] | null) ?? []);
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

  const { activeTasks, completedTasks, agenda, overdue } = useMemo(() => {
    const date = today();
    const visible = tasks.filter(
      (task) => task.task_type === "fixed" || task.scheduled_date === date,
    );
    const active = sortTasks(visible.filter((task) => !completed.has(task.id)));
    const done = sortTasks(visible.filter((task) => completed.has(task.id)));
    const late = sortTasks(
      tasks.filter(
        (task) =>
          task.task_type === "flexible" &&
          task.scheduled_date !== null &&
          task.scheduled_date < date,
      ),
    );
    return {
      activeTasks: active,
      completedTasks: done,
      overdue: late,
      agenda: [...late, ...active].slice(0, 6),
    };
  }, [completed, tasks]);

  const progress = tasks.length
    ? Math.round(
        (completedTasks.length / (activeTasks.length + completedTasks.length)) * 100,
      )
    : 0;

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

  async function addTask(event: FormEvent<HTMLFormElement>) {
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
      priority,
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
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="border-border bg-card overflow-hidden rounded-[2rem] border shadow-[0_16px_35px_rgba(72,50,35,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#5545d6] px-5 py-5 text-white sm:px-6">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-[#dcd8ff] uppercase">
                <Sparkles aria-hidden="true" className="size-3.5" /> Your visual plan
              </p>
              <h2
                className="mt-2 text-xl font-bold tracking-[-0.04em]"
                id="tasks-heading"
              >
                {activeTasks.length
                  ? `${activeTasks.length} things to move through`
                  : "Room to breathe"}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold tracking-[-0.05em]">{progress}%</p>
              <p className="text-xs text-[#dcd8ff]">complete today</p>
            </div>
          </div>

          <form
            className="border-border flex gap-2 border-b bg-[#fffdfb] p-3"
            onSubmit={addTask}
          >
            <span className="text-primary grid size-10 place-items-center">
              <Plus aria-hidden="true" className="size-4" />
            </span>
            <input
              aria-label="Create task"
              className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
              onChange={(event) => setName(event.target.value)}
              placeholder="Create a task…"
              value={name}
            />
            <select
              aria-label="New task priority"
              className="rounded-xl bg-[#f3f0ff] px-2 text-xs font-semibold text-[#5545b8] outline-none"
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              value={priority}
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button aria-label="Add task" size="sm" type="submit">
              Add
            </Button>
          </form>

          {message ? <p className="px-5 pt-4 text-sm text-red-600">{message}</p> : null}
          <div className="divide-y divide-[#f0ebe6]">
            {activeTasks.length ? (
              activeTasks.map((task) => (
                <TaskRow key={task.id} onToggle={() => void toggle(task)} task={task} />
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <span className="text-primary mx-auto grid size-11 place-items-center rounded-2xl bg-[#e6e1ff]">
                  <Check aria-hidden="true" className="size-5" />
                </span>
                <p className="mt-4 font-semibold">Your plan is open</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Add a small next step, or enjoy the space.
                </p>
              </div>
            )}
          </div>

          {completedTasks.length ? (
            <div className="border-t border-[#f0ebe6]">
              <button
                aria-expanded={showCompleted}
                className="text-muted-foreground hover:text-foreground flex min-h-12 w-full items-center justify-between px-5 text-sm font-medium"
                onClick={() => setShowCompleted((current) => !current)}
                type="button"
              >
                <span>Completed today · {completedTasks.length}</span>
                <ChevronDown
                  className={`size-4 transition-transform ${showCompleted ? "rotate-180" : ""}`}
                />
              </button>
              {showCompleted ? (
                <div className="divide-y divide-[#f0ebe6] border-t border-[#f0ebe6]">
                  {completedTasks.map((task) => (
                    <TaskRow
                      done
                      key={task.id}
                      onToggle={() => void toggle(task)}
                      task={task}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="rounded-[2rem] bg-[#ffdc79] p-5 shadow-[0_16px_35px_rgba(98,73,16,0.12)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-[#896217] uppercase">
                Next up
              </p>
              <h3 className="mt-1 text-lg font-bold tracking-[-0.04em]">
                A little focus
              </h3>
            </div>
            <span className="grid size-11 place-items-center rounded-full border-4 border-[#fff3c8] bg-[#fff9e8]">
              <Clock3 aria-hidden="true" className="size-5 text-[#8b6319]" />
            </span>
          </div>
          {overdue.length ? (
            <p className="mt-5 flex items-center gap-2 rounded-xl bg-[#fff0b2] px-3 py-2 text-xs font-semibold text-[#98523a]">
              <Flame aria-hidden="true" className="size-3.5" /> {overdue.length} overdue
            </p>
          ) : null}
          <div className="mt-5 space-y-1">
            {agenda.length ? (
              agenda.map((task) => (
                <AgendaItem
                  key={task.id}
                  overdue={overdue.some((item) => item.id === task.id)}
                  task={task}
                />
              ))
            ) : (
              <p className="py-6 text-sm leading-6 text-[#765d2d]">
                Add a time to a task and it will appear here as your next gentle nudge.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function TaskRow({
  task,
  onToggle,
  done = false,
}: {
  task: Task;
  onToggle: () => void;
  done?: boolean;
}) {
  const priority = task.priority ?? "medium";
  return (
    <button
      className={`group flex min-h-17 w-full items-center gap-3 px-5 text-left transition-colors hover:bg-[#fffaf5] ${done ? "opacity-50" : ""}`}
      onClick={onToggle}
      type="button"
    >
      <span
        className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${done ? "border-primary bg-primary text-primary-foreground" : "group-hover:border-primary border-[#d6cec7] bg-white"}`}
      >
        {done ? <Check aria-hidden="true" className="size-3" /> : null}
      </span>
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${taskTones[task.sort_order % taskTones.length]}`}
      >
        {taskEmoji[task.sort_order % taskEmoji.length]}
      </span>
      <span
        className={`min-w-0 flex-1 text-sm font-semibold ${done ? "text-muted-foreground line-through" : ""}`}
      >
        {task.name}
      </span>
      {task.due_time ? (
        <span className="text-muted-foreground hidden items-center gap-1 text-xs sm:flex">
          <Clock3 className="size-3" /> {formatDueTime(task.due_time)}
        </span>
      ) : null}
      <span
        className={`rounded-lg px-2 py-1 text-[10px] font-bold tracking-wide uppercase ${priorityStyles[priority]}`}
      >
        {priority}
      </span>
    </button>
  );
}

function AgendaItem({ task, overdue }: { task: Task; overdue: boolean }) {
  const date = task.scheduled_date
    ? new Date(`${task.scheduled_date}T00:00:00`)
    : undefined;
  return (
    <div className="flex gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-[#fff0b2]">
      <span
        className={`mt-1.5 size-2 shrink-0 rounded-full ${overdue ? "bg-red-400" : task.due_time ? "bg-primary" : "bg-muted-foreground"}`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{task.name}</p>
        <p className={`mt-1 text-xs ${overdue ? "text-[#ad4b3a]" : "text-[#766031]"}`}>
          {overdue && date
            ? `${format(date, "MMM d")} · overdue`
            : task.due_time
              ? formatDueTime(task.due_time)
              : "Any time"}
        </p>
      </div>
      <Circle aria-hidden="true" className="text-muted-foreground/50 mt-0.5 size-4" />
    </div>
  );
}
