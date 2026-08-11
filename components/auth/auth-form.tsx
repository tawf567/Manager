"use client";

import { useActionState } from "react";

import { signIn, signUp, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: AuthFormState = {};

type AuthFormProps = {
  nextPath?: string;
};

export function AuthForm({ nextPath }: AuthFormProps) {
  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    initialState,
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUp,
    initialState,
  );
  const state = signInState.error || signInState.message ? signInState : signUpState;
  const isPending = signInPending || signUpPending;

  return (
    <form className="space-y-5" noValidate>
      <input name="next" type="hidden" value={nextPath ?? "/today"} />
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
          autoComplete="current-password"
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
      {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      {state.message ? (
        <p className="text-sm text-emerald-300">{state.message}</p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          disabled={isPending}
          formAction={signInAction}
          type="submit"
          variant="secondary"
        >
          {signInPending ? "Signing in…" : "Sign in"}
        </Button>
        <Button disabled={isPending} formAction={signUpAction} type="submit">
          {signUpPending ? "Creating account…" : "Create account"}
        </Button>
      </div>
    </form>
  );
}
