"use client";

import {
  Award,
  CheckSquare2,
  LineChart,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

import { AuthGate } from "../auth/auth-gate";
import { TimezoneSync } from "./timezone-sync";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navigation: NavigationItem[] = [
  { href: "/today", label: "Today", icon: CheckSquare2 },
  { href: "/tracking", label: "Track", icon: Target },
  { href: "/performance", label: "Progress", icon: LineChart },
  { href: "/achievements", label: "Journal", icon: Award },
];

function NavItem({ item, mobile = false }: { item: NavigationItem; mobile?: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "focus-visible:ring-ring flex items-center gap-3 rounded-xl font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
        mobile
          ? "min-h-14 flex-1 flex-col justify-center gap-1 px-1 text-[11px]"
          : "min-h-11 px-3 text-sm",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      href={item.href}
    >
      <Icon aria-hidden="true" className={cn("size-5", mobile && "size-[18px]")} />
      <span>{item.label}</span>
    </Link>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const normalizedPathname =
    pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const isAuthRoute =
    normalizedPathname === "/login" || normalizedPathname.startsWith("/auth/");

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <AuthGate>
      <div className="bg-background text-foreground min-h-dvh">
        <TimezoneSync />
        <aside className="border-border bg-card/90 fixed inset-y-0 left-0 z-20 hidden w-64 border-r px-4 py-5 lg:flex lg:flex-col">
          <Link
            className="focus-visible:ring-ring mb-9 flex min-h-11 items-center gap-3 rounded-xl px-3 focus-visible:ring-2 focus-visible:outline-none"
            href="/today"
          >
            <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl shadow-sm">
              <CheckSquare2 aria-hidden="true" className="size-4" />
            </span>
            <span className="text-base font-bold tracking-[-0.03em]">Manager</span>
          </Link>
          <nav aria-label="Primary navigation" className="space-y-1">
            {navigation.map((item) => (
              <NavItem item={item} key={item.href} />
            ))}
          </nav>
          <div className="mt-auto space-y-3">
            <p className="text-muted-foreground px-3 text-xs leading-5">
              Make room for what matters.
            </p>
            <Link
              className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              href="/settings"
            >
              <Settings aria-hidden="true" className="size-5" />
              Settings
            </Link>
          </div>
        </aside>

        <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 pt-6 pb-24 sm:px-6 lg:ml-64 lg:w-[calc(100%-16rem)] lg:px-12 lg:py-12">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link
              className="flex items-center gap-2 text-base font-bold tracking-[-0.03em]"
              href="/today"
            >
              <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
                <CheckSquare2 aria-hidden="true" className="size-4" />
              </span>
              Manager
            </Link>
            <Link
              aria-label="Open settings"
              className="bg-card border-border text-muted-foreground hover:text-foreground grid size-10 place-items-center rounded-xl border"
              href="/settings"
            >
              <Settings aria-hidden="true" className="size-4" />
            </Link>
          </div>
          {children}
        </main>

        <nav
          aria-label="Primary navigation"
          className="border-border bg-card/95 fixed inset-x-0 bottom-0 z-20 flex min-h-[72px] border-t px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        >
          {navigation.map((item) => (
            <NavItem item={item} key={item.href} mobile />
          ))}
        </nav>
      </div>
    </AuthGate>
  );
}
