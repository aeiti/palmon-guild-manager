import { cn } from "@/lib/utils";

/**
 * Sentry fill 0–5 (docs/components.md §3.2). Colour by fill: 0 red, 1–2 amber,
 * 3+ green — an at-a-glance read of how defended a sanctum is.
 */
export function SentryTrack({
  filled,
  total = 5,
  className,
}: {
  filled: number;
  total?: number;
  className?: string;
}) {
  const color = filled === 0 ? "bg-bad" : filled <= 2 ? "bg-warn" : "bg-good";
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      title={`${filled}/${total} sentries`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "size-2 rounded-full",
            i < filled ? color : "border border-border-2 bg-transparent",
          )}
        />
      ))}
    </span>
  );
}
