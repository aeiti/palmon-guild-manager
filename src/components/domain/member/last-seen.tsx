"use client";

import { cn } from "@/lib/utils";
import type { LastSeenBucket } from "@/lib/game/types";
import { activityFromBucket, formatBucket } from "@/lib/game/last-seen";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Renders the game's last-seen bucket VERBATIM (docs/components.md §3.1, §5.1).
 * It takes a bucket, not a datetime, so it is structurally impossible to render
 * a synthesised "last seen at" — the one design regression to avoid. The
 * tooltip shows only when the bucket was *captured* (a real observation time).
 */
export function LastSeen({
  bucket,
  observedAt,
  className,
}: {
  bucket: LastSeenBucket;
  observedAt: string;
  className?: string;
}) {
  const tier = activityFromBucket(bucket);
  const color =
    bucket.kind === "online"
      ? "text-good"
      : tier === "idle"
        ? "text-warn"
        : tier === "inactive"
          ? "text-bad"
          : "text-text-2";

  const captured = new Date(observedAt).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "cursor-default font-mono text-xs tabular-nums",
              color,
              className,
            )}
          >
            {formatBucket(bucket)}
          </span>
        </TooltipTrigger>
        <TooltipContent>Bucket captured {captured}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
