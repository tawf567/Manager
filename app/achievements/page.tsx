import { Award } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function AchievementsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Progress journal"
        title="Achievements"
        description="A personal history of the milestones and moments worth remembering."
      />
      <section className="border-border bg-secondary/40 grid min-h-72 place-items-center rounded-2xl border border-dashed p-6 text-center">
        <div>
          <Award aria-hidden="true" className="text-primary mx-auto size-10" />
          <h2 className="mt-5 text-lg font-semibold">
            Your progress deserves a history.
          </h2>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
            Timeline entries and image support are planned for Phase 6.
          </p>
          <Button className="mt-5" disabled>
            Add first achievement
          </Button>
        </div>
      </section>
    </div>
  );
}
