"use client";

import { format } from "date-fns";
import { Archive, Plus, SlidersHorizontal } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { calculateTimeRangeDuration } from "@/lib/date/duration";
import { createClient } from "@/lib/supabase/client";
import {
  trackerTypes,
  type Tracker,
  type TrackerEntry,
  type TrackerType,
} from "@/types/tracker";

const today = () => format(new Date(), "yyyy-MM-dd");
const labels: Record<TrackerType, string> = {
  boolean: "Boolean",
  number: "Number",
  duration: "Duration",
  time_range: "Time range",
  rating: "Rating",
  counter: "Counter",
  currency: "Currency",
  streak: "Streak",
};

export function TrackerDashboard() {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [entries, setEntries] = useState<Record<string, TrackerEntry>>({});
  const [name, setName] = useState("");
  const [type, setType] = useState<TrackerType>("boolean");
  const [message, setMessage] = useState<string>();

  async function load() {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const [{ data: trackersData }, { data: entriesData }] = await Promise.all([
      supabase
        .from("trackers")
        .select("*")
        .eq("user_id", auth.user.id)
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("tracker_entries")
        .select("*")
        .eq("user_id", auth.user.id)
        .eq("entry_date", today()),
    ]);
    setTrackers((trackersData as Tracker[] | null) ?? []);
    setEntries(
      Object.fromEntries(
        ((entriesData as TrackerEntry[] | null) ?? []).map((entry) => [
          entry.tracker_id,
          entry,
        ]),
      ),
    );
  }
  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase.from("trackers").insert({
      user_id: auth.user.id,
      name: trimmed,
      tracker_type: type,
      sort_order: trackers.length,
    });
    if (error) {
      setMessage("Couldn’t create tracker.");
      return;
    }
    setName("");
    await load();
  }
  async function archive(tracker: Tracker) {
    const { error } = await createClient()
      .from("trackers")
      .update({ is_active: false })
      .eq("id", tracker.id)
      .eq("user_id", tracker.user_id);
    if (error) {
      setMessage("Couldn’t archive tracker.");
      return;
    }
    await load();
  }
  async function save(tracker: Tracker, values: Partial<TrackerEntry>) {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase.from("tracker_entries").upsert(
      {
        tracker_id: tracker.id,
        user_id: auth.user.id,
        entry_date: today(),
        ...values,
      },
      { onConflict: "tracker_id,entry_date" },
    );
    if (error) {
      setMessage("Couldn’t save entry.");
      return;
    }
    await load();
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground max-w-2xl text-sm leading-6">
        Log only the signals that help you notice patterns and make better choices.
      </p>
      <form
        className="border-border bg-card flex flex-col gap-2 rounded-2xl border p-2 shadow-sm sm:flex-row"
        onSubmit={add}
      >
        <input
          aria-label="Tracker name"
          className="placeholder:text-muted-foreground h-11 flex-1 rounded-xl bg-transparent px-3 text-sm outline-none"
          onChange={(event) => setName(event.target.value)}
          placeholder="Tracker name"
          value={name}
        />
        <select
          aria-label="Tracker type"
          className="bg-secondary h-11 rounded-xl px-3 text-sm outline-none"
          onChange={(event) => setType(event.target.value as TrackerType)}
          value={type}
        >
          {trackerTypes.map((item) => (
            <option key={item} value={item}>
              {labels[item]}
            </option>
          ))}
        </select>
        <Button className="sm:shrink-0" type="submit">
          <Plus aria-hidden="true" className="size-4" />
          Add tracker
        </Button>
      </form>
      {message ? <p className="text-sm text-red-300">{message}</p> : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {trackers.length === 0 ? (
          <p className="border-border bg-card text-muted-foreground rounded-3xl border border-dashed p-8 text-center text-sm leading-6 lg:col-span-2">
            Start with one small signal. You can add more only when they are useful.
          </p>
        ) : (
          trackers.map((tracker) => (
            <TrackerCard
              entry={entries[tracker.id]}
              key={tracker.id}
              onArchive={() => void archive(tracker)}
              onSave={(values) => void save(tracker, values)}
              tracker={tracker}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TrackerCard({
  tracker,
  entry,
  onSave,
  onArchive,
}: {
  tracker: Tracker;
  entry?: TrackerEntry;
  onSave: (values: Partial<TrackerEntry>) => void;
  onArchive: () => void;
}) {
  const isBoolean =
    tracker.tracker_type === "boolean" || tracker.tracker_type === "streak";
  const entryKey = entry
    ? `${entry.id}-${entry.numeric_value}-${entry.duration_minutes}-${entry.start_time}-${entry.end_time}-${entry.rating_value}-${entry.currency_value}`
    : "new";

  return (
    <article className="border-border bg-card rounded-3xl border p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="bg-secondary text-primary grid size-10 place-items-center rounded-2xl">
          <SlidersHorizontal aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-[10px] font-bold tracking-[0.12em] uppercase">
            {labels[tracker.tracker_type]}
          </p>
          <h2 className="mt-1 font-semibold">{tracker.name}</h2>
        </div>
        <Button
          aria-label={`Archive ${tracker.name}`}
          onClick={onArchive}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Archive aria-hidden="true" className="size-4" />
        </Button>
      </div>
      {isBoolean ? (
        <label className="bg-secondary mt-5 flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium">
          <input
            checked={entry?.boolean_value ?? false}
            className="size-5 accent-[var(--primary)]"
            onChange={(event) => onSave({ boolean_value: event.target.checked })}
            type="checkbox"
          />
          Completed today
        </label>
      ) : (
        <TrackerEntryForm
          entry={entry}
          key={entryKey}
          onSave={onSave}
          tracker={tracker}
        />
      )}
      <p className="text-muted-foreground mt-4 text-xs">
        Today: {entry ? display(entry) : "No entry"}
      </p>
    </article>
  );
}

function TrackerEntryForm({
  tracker,
  entry,
  onSave,
}: {
  tracker: Tracker;
  entry?: TrackerEntry;
  onSave: (values: Partial<TrackerEntry>) => void;
}) {
  const initialValue =
    tracker.tracker_type === "duration"
      ? entry?.duration_minutes
      : tracker.tracker_type === "currency"
        ? entry?.currency_value
        : tracker.tracker_type === "rating"
          ? entry?.rating_value
          : entry?.numeric_value;
  const [first, setFirst] = useState(
    tracker.tracker_type === "time_range"
      ? (entry?.start_time?.slice(0, 5) ?? "")
      : initialValue === null || initialValue === undefined
        ? ""
        : String(initialValue),
  );
  const [second, setSecond] = useState(entry?.end_time?.slice(0, 5) ?? "");

  function numericForm(
    kind: "number" | "duration" | "counter" | "currency" | "rating",
  ) {
    return (
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const value = Number(first);
          if (
            !Number.isFinite(value) ||
            (kind === "rating" && (value < 1 || value > 10))
          )
            return;
          onSave(
            kind === "duration"
              ? { duration_minutes: value }
              : kind === "currency"
                ? { currency_value: value, currency_code: "USD" }
                : kind === "rating"
                  ? { rating_value: value }
                  : { numeric_value: value },
          );
        }}
      >
        <input
          className="border-input bg-background focus:ring-ring h-11 min-w-0 flex-1 rounded-xl border px-3 text-sm outline-none focus:ring-2"
          inputMode="decimal"
          max={kind === "rating" ? 10 : undefined}
          min={kind === "rating" ? 1 : undefined}
          onChange={(event) => setFirst(event.target.value)}
          placeholder={
            kind === "duration" ? "Minutes" : kind === "rating" ? "1–10" : "Value"
          }
          type="number"
          value={first}
        />
        <Button size="sm" type="submit">
          Save
        </Button>
      </form>
    );
  }
  return (
    <>
      {tracker.tracker_type === "time_range" ? (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!first || !second) return;
            onSave({
              start_time: first,
              end_time: second,
              duration_minutes: calculateTimeRangeDuration(first, second),
            });
          }}
        >
          <input
            className="border-input bg-background focus:ring-ring h-11 rounded-xl border px-2 text-sm outline-none focus:ring-2"
            onChange={(event) => setFirst(event.target.value)}
            type="time"
            value={first}
          />
          <input
            className="border-input bg-background focus:ring-ring h-11 rounded-xl border px-2 text-sm outline-none focus:ring-2"
            onChange={(event) => setSecond(event.target.value)}
            type="time"
            value={second}
          />
          <Button size="sm" type="submit">
            Save
          </Button>
        </form>
      ) : (
        numericForm(
          tracker.tracker_type as
            "number" | "duration" | "counter" | "currency" | "rating",
        )
      )}
    </>
  );
}
function display(entry: TrackerEntry) {
  if (entry.boolean_value !== null)
    return entry.boolean_value ? "Complete" : "Not complete";
  if (entry.duration_minutes !== null) return `${entry.duration_minutes} min`;
  if (entry.currency_value !== null)
    return `${entry.currency_code ?? "USD"} ${entry.currency_value}`;
  if (entry.rating_value !== null) return `${entry.rating_value}/10`;
  if (entry.numeric_value !== null) return String(entry.numeric_value);
  return "Recorded";
}
