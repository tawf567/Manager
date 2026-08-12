"use client";

import {
  Award,
  CalendarDays,
  LineChart,
  MoonStar,
  Settings,
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
  { href: "/today", label: "My day", icon: CalendarDays },
  { href: "/tracking", label: "Check in", icon: MoonStar },
  { href: "/performance", label: "Patterns", icon: LineChart },
  { href: "/achievements", label: "Wins", icon: Award },
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
          : "min-h-10 rounded-lg px-3 text-sm",
        isActive
          ? "bg-[#e8e3ff] text-[#4635b1]"
          : "text-muted-foreground hover:text-foreground hover:bg-[#f6f2ed]",
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
        <aside className="border-border fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-[#fffbf7]/95 px-4 py-5 lg:flex lg:flex-col">
          <Link
            className="focus-visible:ring-ring mb-8 flex min-h-11 items-center gap-3 rounded-lg px-3 focus-visible:ring-2 focus-visible:outline-none"
            href="/today"
          >
            <span className="text-primary-foreground grid size-10 place-items-center rounded-2xl bg-[#5545d6] shadow-[0_5px_0_#3e32a4]">
              <CalendarDays aria-hidden="true" className="size-5" />
            </span>
            <span className="text-lg font-extrabold tracking-[-0.05em]">Daylight</span>
          </Link>
          <nav aria-label="Primary navigation" className="space-y-1">
            {navigation.map((item) => (
              <NavItem item={item} key={item.href} />
            ))}
          </nav>
          <div className="mt-auto space-y-3">
            <p className="text-muted-foreground px-3 text-xs leading-5">
              A softer way to plan.
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

        <main className="mx-auto min-h-dvh w-full max-w-7xl px-4 pt-6 pb-24 sm:px-6 lg:ml-64 lg:w-[calc(100%-16rem)] lg:px-10 lg:py-10">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link
              className="flex items-center gap-2 text-base font-bold tracking-[-0.03em]"
              href="/today"
            >
              <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
                <CalendarDays aria-hidden="true" className="size-4" />
              </span>
              Daylight
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
