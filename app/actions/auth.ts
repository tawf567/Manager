"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { credentialsSchema } from "@/lib/validation/auth";

export type AuthFormState = {
  error?: string;
  message?: string;
};

function safeNextPath(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/today";
}

function parseCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export async function signIn(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const result = parseCredentials(formData);
  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Check your details and try again.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.data);
  if (error) {
    return { error: "We couldn’t sign you in with those details." };
  }

  redirect(safeNextPath(formData.get("next")));
}

export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const result = parseCredentials(formData);
  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Check your details and try again.",
    };
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) {
    return { error: "The app URL is not configured. Please contact support." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...result.data,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) {
    return { error: "We couldn’t create your account. Please try again." };
  }

  if (data.session) {
    redirect(safeNextPath(formData.get("next")));
  }

  return { message: "Check your email to confirm your account, then sign in." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
