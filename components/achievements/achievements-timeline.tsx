"use client";

import { format } from "date-fns";
import { Award, Plus } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Achievement = {
  id: string;
  title: string;
  description: string | null;
  achievement_date: string;
  achievement_type: string;
};
export function AchievementsTimeline() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string>();
  async function load() {
    const s = createClient();
    const { data: a } = await s.auth.getUser();
    if (!a.user) return;
    const { data } = await s
      .from("achievements")
      .select("id,title,description,achievement_date,achievement_type")
      .eq("user_id", a.user.id)
      .order("achievement_date", { ascending: false });
    setItems((data as Achievement[] | null) ?? []);
  }
  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);
  async function add(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const s = createClient();
    const { data: a } = await s.auth.getUser();
    if (!a.user) return;
    const { error } = await s.from("achievements").insert({
      user_id: a.user.id,
      title: title.trim(),
      description: description.trim() || null,
      achievement_date: format(new Date(), "yyyy-MM-dd"),
    });
    if (error) {
      setMessage("Couldn’t save that entry. Please try again.");
      return;
    }
    setTitle("");
    setDescription("");
    await load();
  }
  return (
    <div className="space-y-8">
      <form
        className="border-border bg-card space-y-3 rounded-3xl border p-5 shadow-sm sm:p-6"
        onSubmit={add}
      >
        <div>
          <p className="text-primary text-xs font-bold tracking-[0.12em] uppercase">
            Add to your story
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
            A moment worth remembering
          </h2>
        </div>
        <input
          aria-label="Achievement title"
          className="border-input bg-background focus:ring-ring h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Achievement title"
          value={title}
        />
        <textarea
          aria-label="Achievement description"
          className="border-input bg-background focus:ring-ring min-h-24 w-full rounded-xl border p-3 text-sm outline-none focus:ring-2"
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened? (optional)"
          value={description}
        />
        <Button type="submit">
          <Plus aria-hidden="true" className="size-4" /> Add to journal
        </Button>
      </form>
      {message ? <p className="text-sm text-red-700">{message}</p> : null}
      <div className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <article
              className="border-border bg-card relative rounded-3xl border p-5 pl-7 shadow-sm sm:p-6 sm:pl-8"
              key={item.id}
            >
              <span className="bg-primary absolute top-7 -left-1 size-2 rounded-full" />
              <p className="text-primary text-xs font-bold tracking-[0.12em] uppercase">
                {format(new Date(`${item.achievement_date}T00:00:00`), "MMMM d, yyyy")}
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                {item.title}
              </h2>
              {item.description ? (
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {item.description}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <div className="border-border bg-card rounded-3xl border border-dashed p-9 text-center">
            <span className="bg-secondary text-primary mx-auto grid size-12 place-items-center rounded-2xl">
              <Award aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-4 font-semibold">Your story starts here</p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Record a win, turning point, or moment you want to remember.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
