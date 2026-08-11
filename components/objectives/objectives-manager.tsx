"use client";

import {
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Save,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { objectiveSchema } from "@/lib/validation/objective";
import type { Objective } from "@/types/objective";

type Draft = { name: string; description: string; color: string };
const blankDraft: Draft = { name: "", description: "", color: "#7c8cff" };

export function ObjectivesManager() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [editingId, setEditingId] = useState<string>();
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string>();

  async function loadObjectives() {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data, error } = await supabase
      .from("objectives")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("is_archived")
      .order("sort_order")
      .order("created_at");
    if (error) {
      setMessage("Couldn’t load objectives. Please refresh and try again.");
      return;
    }
    setObjectives((data as Objective[] | null) ?? []);
  }

  useEffect(() => {
    void Promise.resolve().then(loadObjectives);
  }, []);

  function startEdit(objective: Objective) {
    setEditingId(objective.id);
    setDraft({
      name: objective.name,
      description: objective.description ?? "",
      color: objective.color ?? "#7c8cff",
    });
    setIsCreating(false);
    setMessage(undefined);
  }

  function cancelEdit() {
    setEditingId(undefined);
    setIsCreating(false);
    setDraft(blankDraft);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = objectiveSchema.safeParse(draft);
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check your objective details.");
      return;
    }
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const details = {
      name: parsed.data.name,
      description: parsed.data.description || null,
      color: parsed.data.color,
    };
    const response = editingId
      ? await supabase
          .from("objectives")
          .update(details)
          .eq("id", editingId)
          .eq("user_id", auth.user.id)
      : await supabase.from("objectives").insert({
          ...details,
          user_id: auth.user.id,
          icon: "target",
          sort_order: objectives.length,
        });
    if (response.error) {
      setMessage("Couldn’t save that objective. Please try again.");
      return;
    }
    cancelEdit();
    await loadObjectives();
  }

  async function toggleArchive(objective: Objective) {
    const supabase = createClient();
    const { error } = await supabase
      .from("objectives")
      .update({ is_archived: !objective.is_archived })
      .eq("id", objective.id)
      .eq("user_id", objective.user_id);
    if (error) {
      setMessage("Couldn’t update that objective.");
      return;
    }
    await loadObjectives();
  }

  async function move(objective: Objective, direction: -1 | 1) {
    const active = objectives.filter((item) => !item.is_archived);
    const index = active.findIndex((item) => item.id === objective.id);
    const neighbor = active[index + direction];
    if (!neighbor) return;
    const supabase = createClient();
    const [first, second] = await Promise.all([
      supabase
        .from("objectives")
        .update({ sort_order: neighbor.sort_order })
        .eq("id", objective.id)
        .eq("user_id", objective.user_id),
      supabase
        .from("objectives")
        .update({ sort_order: objective.sort_order })
        .eq("id", neighbor.id)
        .eq("user_id", neighbor.user_id),
    ]);
    if (first.error || second.error) {
      setMessage("Couldn’t reorder objectives. Please try again.");
      return;
    }
    await loadObjectives();
  }

  return (
    <section className="space-y-4" aria-labelledby="objectives-settings-heading">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold" id="objectives-settings-heading">
            Objectives
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            The areas you want to grow intentionally.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsCreating(true);
            setEditingId(undefined);
            setDraft(blankDraft);
          }}
          size="sm"
          type="button"
        >
          <Plus aria-hidden="true" className="size-4" /> Add objective
        </Button>
      </div>
      {isCreating || editingId ? (
        <form
          className="border-border bg-card space-y-3 rounded-2xl border p-4"
          onSubmit={save}
        >
          <input
            className="border-input bg-background h-11 w-full rounded-xl border px-3 text-sm"
            maxLength={80}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            placeholder="Objective name"
            required
            value={draft.name}
          />
          <textarea
            className="border-input bg-background min-h-20 w-full rounded-xl border p-3 text-sm"
            maxLength={280}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
            placeholder="Short description (optional)"
            value={draft.description}
          />
          <label className="text-muted-foreground flex items-center gap-2 text-sm">
            Color{" "}
            <input
              aria-label="Objective color"
              className="size-9 rounded border-0 bg-transparent"
              onChange={(event) => setDraft({ ...draft, color: event.target.value })}
              type="color"
              value={draft.color}
            />
          </label>
          <div className="flex gap-2">
            <Button size="sm" type="submit">
              <Save aria-hidden="true" className="size-4" /> Save
            </Button>
            <Button onClick={cancelEdit} size="sm" type="button" variant="ghost">
              <X aria-hidden="true" className="size-4" /> Cancel
            </Button>
          </div>
        </form>
      ) : null}
      {message ? <p className="text-sm text-red-300">{message}</p> : null}
      <div className="space-y-2">
        {objectives.map((objective) => (
          <article
            className="border-border bg-card flex items-center gap-3 rounded-xl border p-3"
            key={objective.id}
          >
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: objective.color ?? "#7c8cff" }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium">{objective.name}</h3>
              <p className="text-muted-foreground truncate text-xs">
                {objective.is_archived
                  ? "Archived"
                  : (objective.description ?? "No description")}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                aria-label={`Move ${objective.name} up`}
                disabled={objective.is_archived}
                onClick={() => void move(objective, -1)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <ArrowUp aria-hidden="true" className="size-4" />
              </Button>
              <Button
                aria-label={`Move ${objective.name} down`}
                disabled={objective.is_archived}
                onClick={() => void move(objective, 1)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <ArrowDown aria-hidden="true" className="size-4" />
              </Button>
              <Button
                aria-label={`Edit ${objective.name}`}
                onClick={() => startEdit(objective)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Pencil aria-hidden="true" className="size-4" />
              </Button>
              <Button
                aria-label={`${objective.is_archived ? "Restore" : "Archive"} ${objective.name}`}
                onClick={() => void toggleArchive(objective)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <ArchiveRestore aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
