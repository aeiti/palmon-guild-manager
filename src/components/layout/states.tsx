import * as React from "react";
import { Inbox, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// docs/components.md §3.6 — an empty roster and a failed fetch must not look
// the same. Loading/empty/error/loaded are four distinct states.

export function EmptyState({
  icon,
  title,
  detail,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  detail?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-2 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="text-text-3">{icon ?? <Inbox className="size-6" />}</div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-text">{title}</p>
        {detail ? <p className="text-sm text-text-3">{detail}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  detail,
  action,
  className,
}: {
  title?: React.ReactNode;
  detail?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-bad/30 bg-bad/5 px-6 py-12 text-center",
        className,
      )}
    >
      <TriangleAlert className="size-6 text-bad" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-text">{title}</p>
        {detail ? <p className="text-sm text-text-3">{detail}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Generic skeleton block; pass `rows` to stack table-ish placeholders. */
export function LoadingState({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)} aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
