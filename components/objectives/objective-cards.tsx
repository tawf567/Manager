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
    return <div className="bg-muted h-24 animate-pulse rounded-2xl" />;
  }

  if (objectives.length === 0) {
    return (
      <p className="text-muted-foreground bg-muted rounded-2xl px-4 py-5 text-sm">
        Add an objective in Settings to give your days direction.
      </p>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible xl:grid-cols-3">
      {objectives.map((objective) => (
        <article
          className="bg-secondary/70 min-w-[200px] rounded-2xl p-4 sm:min-w-0"
          key={objective.id}
        >
          <span
            className="grid size-9 place-items-center rounded-xl"
            style={{
              backgroundColor: `${objective.color ?? "#a78bfa"}22`,
              color: objective.color ?? "#a78bfa",
            }}
          >
            <ObjectiveIcon className="size-5" icon={objective.icon} />
          </span>
          <h3 className="mt-4 font-semibold">{objective.name}</h3>
          <p className="text-muted-foreground mt-1 min-h-10 text-sm leading-5">
            {objective.description ?? "Define what progress looks like for you."}
          </p>
        </article>
      ))}
    </div>
  );
}
