import { ArrowRight } from "lucide-react";

import { ObjectiveCards } from "@/components/objectives/objective-cards";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

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
        <ObjectiveCards />
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
