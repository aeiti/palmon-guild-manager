"use client";

import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/use-now";

const SERVER_TZ = "Etc/GMT+2"; // UTC−2 (POSIX sign is inverted)

function fmt(iso: string, tz?: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });
}

/**
 * The ONLY way an event time is rendered (docs/components.md §3.3). Server time
 * (UTC−2) is authoritative and always shown; viewer-local is a convenience,
 * rendered only after mount so it can't desync SSR. A bare local time is a bug.
 */
export function TimePair({
  serverTime,
  className,
}: {
  serverTime: string;
  className?: string;
}) {
  const mounted = useMounted();
  return (
    <span className={cn("font-mono text-xs tabular-nums", className)}>
      <span className="text-text-2">{fmt(serverTime, SERVER_TZ)}</span>
      <span className="text-text-3"> SRV</span>
      {mounted ? (
        <>
          <span className="text-text-3"> · </span>
          <span className="text-text-3">{fmt(serverTime)} LOC</span>
        </>
      ) : null}
    </span>
  );
}
