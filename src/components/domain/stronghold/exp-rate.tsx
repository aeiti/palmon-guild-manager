import { cn } from "@/lib/utils";
import { formatExpRate } from "@/lib/format";

/** Desert EXP rate (docs/components.md §3.2): `9,600/h`. Desert amber — one of
 * the two things that colour is reserved for. */
export function ExpRate({
  perHour,
  className,
}: {
  perHour: number;
  className?: string;
}) {
  return (
    <span className={cn("font-mono tabular-nums text-desert", className)}>
      {formatExpRate(perHour)}
    </span>
  );
}
