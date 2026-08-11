"use client";

import {
  Award,
  ChartNoAxesCombined,
  CheckSquare2,
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
  { href: "/tracking", label: "Tracking", icon: Target },
  { href: "/performance", label: "Performance", icon: ChartNoAxesCombined },
  { href: "/achievements", label: "Achievements", icon: Award },
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
          ? "bg-primary/15 text-primary"
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
        <aside className="border-border bg-secondary/75 fixed inset-y-0 left-0 z-20 hidden w-60 border-r px-3 py-5 lg:flex lg:flex-col">
          <Link
            className="focus-visible:ring-ring mb-8 flex min-h-11 items-center gap-3 rounded-xl px-3 focus-visible:ring-2 focus-visible:outline-none"
            href="/today"
          >
            <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
              <CheckSquare2 aria-hidden="true" className="size-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">Manager</span>
          </Link>
          <nav aria-label="Primary navigation" className="space-y-1">
            {navigation.map((item) => (
              <NavItem item={item} key={item.href} />
            ))}
          </nav>
          <p className="text-muted-foreground mt-auto px-3 text-xs leading-5">
            Build a life you’re proud to manage.
          </p>
        </aside>

        <main className="mx-auto min-h-dvh w-full max-w-7xl px-4 pt-6 pb-24 sm:px-6 lg:ml-60 lg:w-[calc(100%-15rem)] lg:px-10 lg:py-10">
          {children}
        </main>

        <nav
          aria-label="Primary navigation"
          className="border-border bg-secondary/95 fixed inset-x-0 bottom-0 z-20 flex min-h-[72px] border-t px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        >
          {navigation.map((item) => (
            <NavItem item={item} key={item.href} mobile />
          ))}
        </nav>
      </div>
    </AuthGate>
  );
}
