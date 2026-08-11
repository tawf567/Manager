import { AchievementsTimeline } from "@/components/achievements/achievements-timeline";
import { PageHeader } from "@/components/layout/page-header";
export default function AchievementsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Progress journal"
        title="Achievements"
        description="A personal history of the milestones and moments worth remembering."
      />
      <AchievementsTimeline />
    </div>
  );
}
