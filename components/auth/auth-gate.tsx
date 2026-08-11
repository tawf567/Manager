"use client";

import { usePathname, useRouter } from "next/navigation";
import { type PropsWithChildren, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function AuthGate({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    void supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!isMounted) return;
        if (!data.user) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        setIsReady(true);
      })
      .catch(() => {
        if (isMounted) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      });

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (!isReady) {
    return (
      <main className="bg-background text-muted-foreground grid min-h-dvh place-items-center">
        <p className="text-sm">Checking your session…</p>
      </main>
    );
  }

  return <>{children}</>;
}
