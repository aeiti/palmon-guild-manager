import { cn } from "@/lib/utils";
import type { Member } from "@/lib/game/types";
import { coverageByHour } from "@/lib/metrics";

/**
 * 24-hour defense-readiness band (docs/components.md §3.8). Height per server
 * hour (UTC−2) = members typically online then, from timezone + online windows.
 * Thin hours read red — that's the point, since the roster spans UTC−8…UTC+9.
 */
export function TimezoneCoverage({
  members,
  className,
}: {
  members: Member[];
  className?: string;
}) {
  const counts = coverageByHour(members);
  const max = Math.max(...counts, 1);
  const H = 80;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-end gap-0.5" style={{ height: H }}>
        {counts.map((c, h) => {
          const barH = Math.max(2, (c / max) * H);
          const thin = c === 0;
          return (
            <div
              key={h}
              className="flex flex-1 flex-col justify-end"
              title={`${String(h).padStart(2, "0")}:00 SRV · ${c} online`}
            >
              <div
                className={cn(
                  "w-full rounded-sm",
                  thin ? "bg-bad/50" : "bg-violet",
                )}
                style={{ height: barH }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between font-mono text-[0.6rem] text-text-3">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
      <p className="text-[0.6rem] text-text-3">
        server hour (UTC−2) · bar height = members typically online · red = gap
      </p>
    </div>
  );
}
