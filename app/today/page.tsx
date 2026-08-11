import { ArrowRight, HeartPulse, Sparkles, WalletCards } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

const objectives = [
  {
    name: "Healthy",
    description: "Build energy through small, repeatable choices.",
    icon: HeartPulse,
  },
  {
    name: "Wealthy",
    description: "Make steady progress toward financial freedom.",
    icon: WalletCards,
  },
  {
    name: "Happiness",
    description: "Make room for what keeps life meaningful.",
    icon: Sparkles,
  },
];

export default function TodayPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your day"
        title="Today"
        description="A calm overview of the things that matter most. Tasks and live progress arrive in the next phases."
      />

      <section aria-labelledby="objectives-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold" id="objectives-heading">
            Objectives
          </h2>
          <Button asChild size="sm" variant="ghost">
            <a href="/settings">
              Manage <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          </Button>
        </div>
        <div className="flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
          {objectives.map(({ name, description, icon: Icon }) => (
            <article
              className="border-border bg-card min-w-[260px] snap-start rounded-2xl border p-5 lg:min-w-0"
              key={name}
            >
              <span className="bg-primary/15 text-primary grid size-10 place-items-center rounded-xl">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-5 font-semibold">{name}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {description}
              </p>
              <div
                className="bg-muted mt-5 h-1.5 overflow-hidden rounded-full"
                aria-label="Progress pending setup"
              >
                <div className="bg-primary h-full w-0 rounded-full" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="border-border bg-secondary/40 rounded-2xl border border-dashed p-6 text-center sm:p-10"
        aria-labelledby="tasks-heading"
      >
        <h2 className="text-lg font-semibold" id="tasks-heading">
          Your tasks will live here
        </h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
          Phase 3 will add fixed habits, flexible tasks, and completion history.
        </p>
      </section>
    </div>
  );
}
