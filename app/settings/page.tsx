import { Settings2 } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const { data: settings } = data.user
    ? await supabase
        .from("user_settings")
        .select("timezone, theme, preferred_currency, week_start_day")
        .eq("user_id", data.user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Personal preferences"
        title="Settings"
        description="Profile, timezone, theme, and objective management will be connected in Phases 1 and 2."
      />
      <section className="border-border bg-card flex items-center gap-4 rounded-2xl border p-5">
        <span className="bg-primary/15 text-primary grid size-11 place-items-center rounded-xl">
          <Settings2 aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold">{data.user?.email ?? "Signed-in user"}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {settings?.timezone ?? "Timezone is syncing from your browser"} ·{" "}
            {settings?.theme ?? "dark"} theme
          </p>
        </div>
        <form action={signOut} className="ml-auto">
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </section>
    </div>
  );
}
