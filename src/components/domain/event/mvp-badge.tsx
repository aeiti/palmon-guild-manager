import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The one trophy in the app: the event's top scorer. Gold (its own `--gold`
 * accent, brighter than rank-5 amber) with a slow shimmer + a twinkling star.
 * The motion is subtle and self-disables under prefers-reduced-motion (see the
 * base layer in globals.css), so it stays a badge, not a distraction.
 */
export function MvpBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "mvp-shimmer inline-flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide tabular-nums text-gold",
        className,
      )}
      title="Most Valuable Player"
    >
      <Star className="mvp-twinkle size-2.5 fill-gold" />
      MVP
    </span>
  );
}
