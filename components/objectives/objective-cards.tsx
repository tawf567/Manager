"use client";

import { useEffect, useState } from "react";

import { ObjectiveIcon } from "@/components/objectives/objective-icon";
import { createClient } from "@/lib/supabase/client";
import type { Objective } from "@/types/objective";

export function ObjectiveCards() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: items } = await supabase
        .from("objectives")
        .select("*")
        .eq("user_id", data.user.id)
        .eq("is_archived", false)
        .order("sort_order")
        .order("created_at");
      setObjectives((items as Objective[] | null) ?? []);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="border-border bg-card h-40 animate-pulse rounded-2xl border" />
    );
  }

  if (objectives.length === 0) {
    return (
      <p className="border-border text-muted-foreground rounded-2xl border border-dashed p-5 text-sm">
        Add an objective in Settings to get started.
      </p>
    );
  }

  return (
    <div className="flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
      {objectives.map((objective) => (
        <article
          className="border-border bg-card min-w-[260px] snap-start rounded-2xl border p-5 lg:min-w-0"
          key={objective.id}
        >
          <span
            className="grid size-10 place-items-center rounded-xl"
            style={{
              backgroundColor: `${objective.color ?? "#7c8cff"}22`,
              color: objective.color ?? "#7c8cff",
            }}
          >
            <ObjectiveIcon className="size-5" icon={objective.icon} />
          </span>
          <h3 className="mt-5 font-semibold">{objective.name}</h3>
          <p className="text-muted-foreground mt-2 min-h-12 text-sm leading-6">
            {objective.description ?? "Define what progress looks like for you."}
          </p>
          <div
            aria-label="Progress pending task setup"
            className="bg-muted mt-5 h-1.5 overflow-hidden rounded-full"
          >
            <div
              className="h-full w-0 rounded-full"
              style={{ backgroundColor: objective.color ?? "#7c8cff" }}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
