import { PageHeader } from "@/components/layout/page-header";
import { PerformanceDashboard } from "@/components/performance/performance-dashboard";
export default function PerformancePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Honest insights"
        title="Performance"
        description="Clear trends calculated only from your activity."
      />
      <PerformanceDashboard />
    </div>
  );
}
