"use client";

import { subDays, format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { createClient } from "@/lib/supabase/client";
import {
  calculateAverage,
  calculateDurationTotal,
  calculateTaskCompletionRate,
} from "@/lib/analytics";
import type { Task } from "@/types/task";

type Completion = { task_id: string; date: string; completed: boolean };
type Entry = {
  tracker_id: string;
  entry_date: string;
  duration_minutes: number | null;
  numeric_value: number | null;
};
const ranges = [7, 30, 90] as const;

export function PerformanceDashboard() {
  const [days, setDays] = useState<(typeof ranges)[number]>(7);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const start = format(subDays(new Date(), days - 1), "yyyy-MM-dd");
      const [taskResult, completionResult, entryResult] = await Promise.all([
        supabase.from("tasks").select("*").eq("user_id", data.user.id),
        supabase
          .from("task_completions")
          .select("task_id,date,completed")
          .eq("user_id", data.user.id)
          .gte("date", start),
        supabase
          .from("tracker_entries")
          .select("tracker_id,entry_date,duration_minutes,numeric_value")
          .eq("user_id", data.user.id)
          .gte("entry_date", start),
      ]);
      setTasks((taskResult.data as Task[] | null) ?? []);
      setCompletions((completionResult.data as Completion[] | null) ?? []);
      setEntries((entryResult.data as Entry[] | null) ?? []);
    });
  }, [days]);
  const metrics = useMemo(() => {
    const active = tasks.filter((task) => task.is_active);
    const start = format(subDays(new Date(), days - 1), "yyyy-MM-dd");
    const end = format(new Date(), "yyyy-MM-dd");
    const fixed = active.filter((task) => task.task_type === "fixed");
    const flexible = active.filter(
      (task) =>
        task.task_type === "flexible" &&
        task.scheduled_date !== null &&
        task.scheduled_date >= start &&
        task.scheduled_date <= end,
    );
    const fixedIds = new Set(fixed.map((task) => task.id));
    const flexibleDates = new Map(
      flexible.map((task) => [task.id, task.scheduled_date]),
    );
    const fixedCompletions = completions.filter((item) => fixedIds.has(item.task_id));
    const flexibleCompletions = completions.filter(
      (item) => flexibleDates.get(item.task_id) === item.date,
    );
    const fixedExpected = fixed.reduce((total, task) => {
      const createdDate = task.created_at.slice(0, 10);
      const firstExpectedDate = createdDate > start ? createdDate : start;
      const activeDays = Math.max(
        0,
        Math.floor(
          (new Date(`${format(new Date(), "yyyy-MM-dd")}T00:00:00`).getTime() -
            new Date(`${firstExpectedDate}T00:00:00`).getTime()) /
            86400000,
        ) + 1,
      );
      return total + activeDays;
    }, 0);
    const flexibleExpected = flexible.length;
    const durations = entries.filter((entry) => entry.duration_minutes !== null);
    return {
      rate: calculateTaskCompletionRate(fixedExpected + flexibleExpected, [
        ...fixedCompletions,
        ...flexibleCompletions,
      ]),
      fixed: calculateTaskCompletionRate(fixedExpected, fixedCompletions),
      flexible: calculateTaskCompletionRate(flexibleExpected, flexibleCompletions),
      deepWork: calculateDurationTotal(durations),
      average: calculateAverage(
        entries.map((entry) => entry.numeric_value ?? 0).filter((value) => value > 0),
      ),
    };
  }, [tasks, completions, entries, days]);
  const chartData = useMemo(
    () =>
      Array.from({ length: days }, (_, index) => {
        const date = format(subDays(new Date(), days - 1 - index), "yyyy-MM-dd");
        return {
          day: format(new Date(`${date}T00:00:00`), "MMM d"),
          completed: completions.filter((item) => item.date === date && item.completed)
            .length,
        };
      }),
    [days, completions],
  );
  return (
    <div className="space-y-8">
      <div
        className="bg-secondary inline-flex rounded-xl p-1"
        aria-label="Review period"
      >
        {ranges.map((range) => (
          <button
            aria-pressed={days === range}
            className={`min-h-9 rounded-lg px-4 text-sm font-semibold transition-colors ${days === range ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            key={range}
            onClick={() => setDays(range)}
            type="button"
          >
            {range} days
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Completion" value={`${metrics.rate}%`} />
        <Metric label="Daily habits" value={`${metrics.fixed}%`} />
        <Metric label="One-off tasks" value={`${metrics.flexible}%`} />
        <Metric label="Tracked time" value={`${Math.round(metrics.deepWork / 60)}h`} />
      </div>
      <section className="border-border bg-card rounded-3xl border p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">Completed tasks</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Your actual completion history over the selected period.
        </p>
        <div className="mt-6 h-64">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" stroke="#aaa59a" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} stroke="#aaa59a" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#fffefd",
                  border: "1px solid #e5e1d8",
                  borderRadius: 12,
                  color: "#292722",
                }}
              />
              <Bar dataKey="completed" fill="#526a4d" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="bg-primary text-primary-foreground rounded-3xl p-5 sm:p-6">
        <p className="text-primary-foreground/70 text-xs font-bold tracking-[0.12em] uppercase">
          Your review
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
          A simple insight
        </h2>
        <p className="text-primary-foreground/80 mt-2 text-sm leading-6">
          {metrics.rate
            ? `You completed ${metrics.rate}% of your planned task instances in the last ${days} days.`
            : "Add tasks and tracker entries to reveal useful, honest trends."}
        </p>
      </section>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="border-border bg-card rounded-2xl border p-5 shadow-sm">
      <p className="text-muted-foreground text-xs font-bold tracking-[0.08em] uppercase">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{value}</p>
    </article>
  );
}
