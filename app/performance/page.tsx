import { ChartNoAxesCombined } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";

export default function PerformancePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Honest insights"
        title="Performance"
        description="Your data will turn into clear trends and practical insight here."
      />
      <section className="border-border bg-secondary/40 grid min-h-72 place-items-center rounded-2xl border border-dashed p-6 text-center">
        <div>
          <ChartNoAxesCombined
            aria-hidden="true"
            className="text-primary mx-auto size-10"
          />
          <h2 className="mt-5 text-lg font-semibold">Data needs a little history.</h2>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
            Analytics and charts are planned for Phase 5 after task and tracker data
            exist.
          </p>
        </div>
      </section>
    </div>
  );
}
