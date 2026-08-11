"use client";
import { format } from "date-fns";
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
    await s
      .from("achievements")
      .insert({
        user_id: a.user.id,
        title: title.trim(),
        description: description.trim() || null,
        achievement_date: format(new Date(), "yyyy-MM-dd"),
      });
    setTitle("");
    setDescription("");
    await load();
  }
  return (
    <div className="space-y-6">
      <form
        className="border-border bg-card space-y-3 rounded-2xl border p-4"
        onSubmit={add}
      >
        <input
          className="border-input bg-background h-11 w-full rounded-xl border px-3 text-sm"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Achievement title"
          value={title}
        />
        <textarea
          className="border-input bg-background min-h-20 w-full rounded-xl border p-3 text-sm"
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened? (optional)"
          value={description}
        />
        <Button type="submit">Add achievement</Button>
      </form>
      <div className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <article
              className="border-border bg-card rounded-2xl border p-5"
              key={item.id}
            >
              <p className="text-primary text-xs font-semibold tracking-wider uppercase">
                {format(new Date(`${item.achievement_date}T00:00:00`), "MMMM d, yyyy")}
              </p>
              <h2 className="mt-2 font-semibold">{item.title}</h2>
              {item.description ? (
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {item.description}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <p className="border-border text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            Your progress deserves a history. Add your first achievement.
          </p>
        )}
      </div>
    </div>
  );
}
