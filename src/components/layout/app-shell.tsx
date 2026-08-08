"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Castle,
  Swords,
  TrendingUp,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/strongholds", label: "Strongholds", icon: Castle },
  { href: "/events", label: "Events", icon: Swords },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Ticks once a second. Server snapshot is null so there is no hydration
 * mismatch; the second-bucket snapshot keeps React from re-rendering in a loop. */
function useNow(): Date | null {
  const subscribe = React.useCallback((onChange: () => void) => {
    const id = setInterval(onChange, 1000);
    return () => clearInterval(id);
  }, []);
  const seconds = React.useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 1000),
    () => null,
  );
  return seconds === null ? null : new Date(seconds * 1000);
}

/** Live server (UTC−2) + local clock. A stand-in until the time set's
 * ServerClock lands; kept minimal and hydration-safe. */
function MiniClock() {
  const now = useNow();

  const fmt = (tz?: string) =>
    now
      ? now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: tz,
        })
      : "--:--";

  return (
    <div className="flex flex-col gap-0.5 font-mono text-xs tabular-nums">
      <span className="text-text-2">
        <span className="text-text-3">SRV</span> {fmt("Etc/GMT+2")}
      </span>
      <span className="text-text-3">LOC {fmt()}</span>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex flex-col leading-none">
      <span className="font-mono text-lg uppercase tracking-[0.18em] text-text">
        VOID
      </span>
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-text-3">
        Server #111
      </span>
    </Link>
  );
}

function UserChip() {
  return (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarFallback>AE</AvatarFallback>
      </Avatar>
      <div className="flex flex-col leading-tight">
        <span className="text-sm text-text">aeiti</span>
        <span className="font-mono text-[0.65rem] uppercase tracking-wide text-text-3">
          R4 · Admin
        </span>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-1">
      {/* Desktop nav rail */}
      <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-border bg-surface px-4 py-5 md:flex">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Brand />
            <MiniClock />
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-violet/10 text-violet"
                      : "text-text-2 hover:bg-surface-2 hover:text-text",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <UserChip />
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
          <Brand />
          <MiniClock />
        </div>

        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-8">
          {children}
        </main>

        {/* Mobile bottom bar */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-surface/95 px-2 py-2 backdrop-blur md:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md px-2 py-1 text-[0.6rem] uppercase tracking-wide transition-colors",
                  active ? "text-violet" : "text-text-3 hover:text-text",
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
