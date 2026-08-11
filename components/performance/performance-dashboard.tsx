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
    const completed = completions.filter((item) => item.completed).length;
    const expected = active.length * days;
    const rate = expected ? Math.round((completed / expected) * 100) : 0;
    const flexibleIds = active
      .filter((task) => task.task_type === "flexible")
      .map((task) => task.id);
    const fixedIds = active
      .filter((task) => task.task_type === "fixed")
      .map((task) => task.id);
    const durations = entries.filter((entry) => entry.duration_minutes !== null);
    return {
      rate,
      fixed: calculateTaskCompletionRate(fixedIds, completions),
      flexible: calculateTaskCompletionRate(flexibleIds, completions),
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
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {ranges.map((range) => (
          <button
            className={`min-h-10 rounded-xl px-4 text-sm ${days === range ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            key={range}
            onClick={() => setDays(range)}
            type="button"
          >
            {range} Days
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Task completion" value={`${metrics.rate}%`} />
        <Metric label="Fixed habits" value={`${metrics.fixed}%`} />
        <Metric label="Flexible tasks" value={`${metrics.flexible}%`} />
        <Metric
          label="Duration total"
          value={`${Math.round(metrics.deepWork / 60)}h`}
        />
      </div>
      <section className="border-border bg-card rounded-2xl border p-5">
        <h2 className="font-semibold">Completed tasks</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Your actual completion history over the selected period.
        </p>
        <div className="mt-5 h-64">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" stroke="#9aa4b2" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} stroke="#9aa4b2" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#1a1f26",
                  border: "1px solid #252b33",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="completed" fill="#7c8cff" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="border-border bg-card rounded-2xl border p-5">
        <h2 className="font-semibold">Data-led insight</h2>
        <p className="text-muted-foreground mt-2 text-sm">
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
    <article className="border-border bg-card rounded-2xl border p-5">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </article>
  );
}
