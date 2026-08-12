import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { ObjectiveCards } from "@/components/objectives/objective-cards";
import { PageHeader } from "@/components/layout/page-header";
import { TodayTasks } from "@/components/tasks/today-tasks";
import { WeekStrip } from "@/components/tasks/week-strip";
import { Button } from "@/components/ui/button";

export default function TodayPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Make it yours"
        title="A plan that feels doable."
        description="See your day in one friendly view, take one step at a time, and leave room for real life."
      />

      <WeekStrip />

      <TodayTasks />

      <section
        aria-labelledby="objectives-heading"
        className="border-border bg-card rounded-[2rem] border p-5 shadow-[0_16px_35px_rgba(72,50,35,0.06)] sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-primary flex items-center gap-2 text-xs font-bold tracking-[0.12em] uppercase">
              <Sparkles aria-hidden="true" className="size-3.5" /> Direction
            </p>
            <h2 className="mt-1 text-lg font-semibold" id="objectives-heading">
              What you’re making room for
            </h2>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/settings">
              Edit <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
        <ObjectiveCards />
      </section>
    </div>
  );
}
