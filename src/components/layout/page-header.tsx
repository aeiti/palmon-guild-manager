import * as React from "react";
import { cn } from "@/lib/utils";

// docs/components.md §3.6
export function PageHeader({
  eyebrow,
  title,
  sub,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4",
        className,
      )}
    >
      <div className="space-y-1">
        {eyebrow ? (
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-3">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold text-text">{title}</h1>
        {sub ? <p className="text-sm text-text-2">{sub}</p> : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-mono text-xs uppercase tracking-[0.16em] text-text-3",
        className,
      )}
    >
      {children}
    </h2>
  );
}
