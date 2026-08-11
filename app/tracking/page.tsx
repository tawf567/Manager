import { Target } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function TrackingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Daily signals"
        title="Tracking"
        description="Keep the few measurements that help you make better decisions."
      />
      <section className="border-border bg-secondary/40 grid min-h-72 place-items-center rounded-2xl border border-dashed p-6 text-center">
        <div>
          <span className="bg-primary/15 text-primary mx-auto grid size-12 place-items-center rounded-xl">
            <Target aria-hidden="true" className="size-6" />
          </span>
          <h2 className="mt-5 text-lg font-semibold">Track what matters.</h2>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
            Tracker creation and daily entries are planned for Phase 4.
          </p>
          <Button className="mt-5" disabled>
            Create your first tracker
          </Button>
        </div>
      </section>
    </div>
  );
}
