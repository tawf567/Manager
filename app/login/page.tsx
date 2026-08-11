import { CheckSquare2 } from "lucide-react";

import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="bg-background grid min-h-dvh place-items-center px-4 py-8">
      <section className="border-border bg-card w-full max-w-md rounded-2xl border p-6 shadow-2xl shadow-black/20 sm:p-8">
        <span className="bg-primary text-primary-foreground grid size-10 place-items-center rounded-xl">
          <CheckSquare2 aria-hidden="true" className="size-5" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
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
