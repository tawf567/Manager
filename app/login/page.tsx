import { CheckSquare2 } from "lucide-react";

import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="bg-background grid min-h-dvh place-items-center px-4 py-8">
      <section className="border-border bg-card w-full max-w-md rounded-3xl border p-6 shadow-[0_20px_60px_rgba(57,54,47,0.12)] sm:p-8">
        <span className="bg-primary text-primary-foreground grid size-11 place-items-center rounded-2xl shadow-sm">
          <CheckSquare2 aria-hidden="true" className="size-5" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">
          Welcome to Manager
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Sign in or create an account to manage what matters.
        </p>
        <div className="border-border my-6 border-t" />
        <AuthForm />
      </section>
    </main>
  );
}
