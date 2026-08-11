import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const timezoneSchema = z.object({
  timezone: z.string().trim().min(1).max(100),
});

export async function POST(request: Request) {
  const input = timezoneSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ error: "Invalid timezone." }, { status: 400 });
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: input.data.timezone });
  } catch {
    return NextResponse.json({ error: "Invalid timezone." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: data.user.id, timezone: input.data.timezone },
      { onConflict: "user_id" },
    );
  if (error) {
    return NextResponse.json({ error: "Unable to save timezone." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
