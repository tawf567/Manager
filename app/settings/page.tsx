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
    <div className="space-y-8">
      <PageHeader
        eyebrow="Personal preferences"
        title="Settings"
        description="Profile and preferences for your account."
      />
      <section className="border-border bg-card flex items-center gap-4 rounded-2xl border p-5">
        <span className="bg-primary/15 text-primary grid size-11 place-items-center rounded-xl">
          <Settings2 aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold">{email ?? "Signed-in user"}</h2>
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
      <ObjectivesManager />
      <TasksManager />
    </div>
  );
}
