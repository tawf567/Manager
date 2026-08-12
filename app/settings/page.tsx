"use client";

import { Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ObjectivesManager } from "@/components/objectives/objectives-manager";
import { TasksManager } from "@/components/tasks/tasks-manager";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type UserSettings = { theme: string; timezone: string };

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>();
  const [settings, setSettings] = useState<UserSettings>();

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email);
      const { data: storedSettings } = await supabase
        .from("user_settings")
        .select("timezone, theme")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (storedSettings) setSettings(storedSettings);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Your space"
        title="Settings"
        description="Set up the parts of Manager that support your daily rhythm."
      />
      <section className="border-border bg-card flex flex-wrap items-center gap-4 rounded-3xl border p-5 shadow-sm sm:p-6">
        <span className="bg-secondary text-primary grid size-11 place-items-center rounded-2xl">
          <Settings2 aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-muted-foreground text-xs font-bold tracking-[0.1em] uppercase">
            Account
          </p>
          <h2 className="mt-1 font-semibold">{email ?? "Signed-in user"}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {settings?.timezone ?? "Timezone is syncing from your browser"} ·{" "}
            {settings?.theme ?? "dark"} theme
          </p>
        </div>
        <Button
          className="ml-auto"
          onClick={handleSignOut}
          type="button"
          variant="outline"
        >
          Sign out
        </Button>
      </section>
      <div className="grid gap-10 xl:grid-cols-2 xl:items-start">
        <ObjectivesManager />
        <TasksManager />
      </div>
    </div>
  );
}
