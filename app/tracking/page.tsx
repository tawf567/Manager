import { PageHeader } from "@/components/layout/page-header";
import { TrackerDashboard } from "@/components/trackers/tracker-dashboard";

export default function TrackingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Daily signals"
        title="Track"
        description="Keep the few measurements that help you make better decisions."
      />
      <TrackerDashboard />
    </div>
  );
}
