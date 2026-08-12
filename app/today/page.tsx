import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { ObjectiveCards } from "@/components/objectives/objective-cards";
import { PageHeader } from "@/components/layout/page-header";
import { TodayTasks } from "@/components/tasks/today-tasks";
import { Button } from "@/components/ui/button";

export default function TodayPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Your daily space"
        title="Today"
        description="Keep the day simple. Start with what needs your attention, then let the rest follow."
      />

      <TodayTasks />

      <section
        aria-labelledby="objectives-heading"
        className="border-border bg-card rounded-3xl border p-5 sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-primary flex items-center gap-2 text-xs font-bold tracking-[0.12em] uppercase">
              <Sparkles aria-hidden="true" className="size-3.5" /> Direction
            </p>
            <h2 className="mt-1 text-lg font-semibold" id="objectives-heading">
              What you’re building
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
