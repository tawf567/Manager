"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { safeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const code = parameters.get("code");
    if (!code) {
      queueMicrotask(() =>
        setError("That confirmation link is missing its sign-in code."),
      );
      return;
    }
    void createClient()
      .auth.exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        if (exchangeError) {
          setError("That confirmation link is invalid or has expired.");
          return;
        }
        router.replace(safeNextPath(parameters.get("next")));
      });
  }, [router]);

  return (
    <main className="bg-background grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold">
          {error ? "Unable to sign you in" : "Confirming your account…"}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {error ?? "One moment while we set up your session."}
        </p>
      </div>
    </main>
  );
}
