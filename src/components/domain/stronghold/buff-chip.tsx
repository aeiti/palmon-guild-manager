import { cn } from "@/lib/utils";
import { formatBuff } from "@/lib/format";
import { BUFF_LABEL, type BuffType } from "@/lib/game/stronghold";

/**
 * A single buff (docs/components.md §3.2). Always desert amber — except a
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
        zero
          ? "border-bad/30 bg-bad/10 text-bad"
          : "border-desert/30 bg-desert/10 text-desert",
        className,
      )}
    >
      {BUFF_LABEL[type]} {formatBuff(value)}
    </span>
  );
}
