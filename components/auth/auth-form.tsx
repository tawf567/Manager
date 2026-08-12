"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getBasePath, safeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/client";
import { credentialsSchema } from "@/lib/validation/auth";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);

    const formData = new FormData(event.currentTarget);
    const credentials = credentialsSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!credentials.success) {
      setError(
        credentials.error.issues[0]?.message ?? "Check your details and try again.",
      );
      return;
    }

    setIsPending(true);
    const supabase = createClient();
    const nextPath = safeNextPath(
      new URLSearchParams(window.location.search).get("next"),
    );

    if (mode === "sign-in") {
      const { error: signInError } = await supabase.auth.signInWithPassword(
        credentials.data,
      );
      setIsPending(false);
      if (signInError) {
        setError("We couldn’t sign you in with those details.");
        return;
      }
      router.replace(nextPath);
      return;
    }

    const redirectUrl = new URL(
      `${getBasePath()}/auth/callback/`,
      window.location.origin,
    );
    redirectUrl.searchParams.set("next", nextPath);
    const { data, error: signUpError } = await supabase.auth.signUp({
      ...credentials.data,
      options: { emailRedirectTo: redirectUrl.toString() },
    });
    setIsPending(false);
    if (signUpError) {
      setError("We couldn’t create your account. Please try again.");
      return;
    }
    if (data.session) {
      router.replace(nextPath);
      return;
    }
    setMessage("Check your email to confirm your account, then sign in.");
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="border-input bg-background focus:border-primary focus:ring-ring h-11 w-full rounded-xl border px-3 text-sm transition outline-none focus:ring-2"
          id="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          className="border-input bg-background focus:border-primary focus:ring-ring h-11 w-full rounded-xl border px-3 text-sm transition outline-none focus:ring-2"
          id="password"
          maxLength={72}
          minLength={8}
          name="password"
          placeholder="At least 8 characters"
          required
          type="password"
        />
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
      </Button>
      <button
        className="text-muted-foreground hover:text-foreground mx-auto block min-h-11 text-sm underline underline-offset-4"
        disabled={isPending}
        onClick={() => {
          setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
          setError(undefined);
          setMessage(undefined);
        }}
        type="button"
      >
        {mode === "sign-in"
          ? "Need an account? Create one"
          : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
