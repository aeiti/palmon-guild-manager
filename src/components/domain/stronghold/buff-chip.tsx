import { cn } from "@/lib/utils";
import { formatBuff } from "@/lib/format";
import { BUFF_LABEL, type BuffType } from "@/lib/game/stronghold";

/**
 * Per-type buff colour (docs/components.md §3.2). Each buff category gets its
 * own hue from the `--buff-*` ramp so a stack of chips reads at a glance rather
 * than as a wall of amber. Full class strings (not interpolated) so Tailwind's
 * scanner keeps them.
 */
const BUFF_STYLE: Record<BuffType, string> = {
  gold: "border-buff-gold/30 bg-buff-gold/10 text-buff-gold",
  steel: "border-buff-steel/30 bg-buff-steel/10 text-buff-steel",
  lumber: "border-buff-lumber/30 bg-buff-lumber/10 text-buff-lumber",
  harvesting:
    "border-buff-harvesting/30 bg-buff-harvesting/10 text-buff-harvesting",
  construction:
    "border-buff-construction/30 bg-buff-construction/10 text-buff-construction",
  research: "border-buff-research/30 bg-buff-research/10 text-buff-research",
};

/**
 * A single buff (docs/components.md §3.2). Coloured by type — except a
 * `value: 0`, which renders red: an uncovered category is information, not
 * absence (§5.5).
 */
export function BuffChip({
  type,
  value,
  className,
}: {
  type: BuffType;
  value: number;
  className?: string;
}) {
  const zero = value === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-xs tabular-nums",
        zero ? "border-bad/30 bg-bad/10 text-bad" : BUFF_STYLE[type],
        className,
      )}
    >
      {BUFF_LABEL[type]} {formatBuff(value)}
    </span>
  );
}
