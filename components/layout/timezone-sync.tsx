"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

export function TimezoneSync() {
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timezone) return;

    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      void supabase
        .from("user_settings")
        .upsert({ user_id: data.user.id, timezone }, { onConflict: "user_id" });
    });
  }, []);

  return null;
}
