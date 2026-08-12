import { PageHeader } from "@/components/layout/page-header";
import { PerformanceDashboard } from "@/components/performance/performance-dashboard";
export default function PerformancePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your review"
        title="Progress"
        description="Simple patterns drawn from the activity you’ve actually logged."
      />
      <PerformanceDashboard />
    </div>
  );
}
