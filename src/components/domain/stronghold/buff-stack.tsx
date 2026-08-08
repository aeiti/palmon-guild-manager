import { cn } from "@/lib/utils";
import {
  BUFF_TYPES,
  computeBuffTotals,
  type Stronghold,
} from "@/lib/game/stronghold";
import { BuffChip } from "./buff-chip";

/**
 * The additive buff totals across all sanctums (docs/components.md §3.2). It
 * COMPUTES from the stronghold rows — never takes pre-summed values — so it
 * can't drift from the detail cards, and it surfaces zero-coverage gaps (VOID
 * holds no Woodsong/Scholar → lumber & research read 0, in red).
 */
export function BuffStack({
  strongholds,
  className,
}: {
  strongholds: Stronghold[];
  className?: string;
}) {
  const totals = computeBuffTotals(strongholds);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {BUFF_TYPES.map((t) => (
        <BuffChip key={t} type={t} value={totals[t]} />
      ))}
    </div>
  );
}
