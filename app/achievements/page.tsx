import { AchievementsTimeline } from "@/components/achievements/achievements-timeline";
import { PageHeader } from "@/components/layout/page-header";
export default function AchievementsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Progress journal"
        title="Journal"
        description="A calm record of the milestones and moments worth remembering."
      />
      <AchievementsTimeline />
    </div>
  );
}
