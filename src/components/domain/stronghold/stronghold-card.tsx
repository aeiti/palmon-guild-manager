import type { Member } from "@/lib/game/types";
import {
  expPerHour,
  governorCapacity,
  sanctumBuffs,
  type Stronghold,
} from "@/lib/game/stronghold";
import { Card, CardBody } from "@/components/ui/card";
import { Coords } from "./coords";
import { ExpRate } from "./exp-rate";
import { BuffChip } from "./buff-chip";
import { RoleSlot } from "./role-slot";
import { OccupationWindow } from "./occupation-window";

function LevelBadge({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border-2 bg-surface-2 px-1.5 py-0.5 font-mono text-xs tabular-nums text-text-2">
      L{level}
    </span>
  );
}

/**
 * Stronghold card (docs/components.md §3.2). Sanctum variant: level, buffs,
 * role slots, EXP/h, death rate, occupation window. Ruin variant:
 * level, EXP/h, coords only — no role or buff affordances at all.
 */
export function StrongholdCard({
  stronghold: s,
  members,
  canEdit = false,
  className,
}: {
  stronghold: Stronghold;
  members: Member[];
  canEdit?: boolean;
  className?: string;
}) {
  const byId = new Map(members.map((m) => [m.id, m]));
  const exp = expPerHour(s);

  // ---- Desert ruin: minimal ----
  if (s.category === "desertRuin") {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LevelBadge level={s.level} />
            <span className="text-sm text-text-2">Desert Ruin</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <ExpRate perHour={exp} />
            <Coords x={s.coordX} y={s.coordY} />
          </div>
        </CardBody>
      </Card>
    );
  }

  // ---- Sanctum: full ----
  const buffs = s.sanctumType ? sanctumBuffs(s.sanctumType, s.level) : [];
  const capacity = governorCapacity(s.level);
  const governors = s.governorIds ?? [];

  return (
    <Card className={className}>
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <LevelBadge level={s.level} />
            <span className="text-sm font-medium text-text">{s.name}</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <ExpRate perHour={exp} />
            <Coords x={s.coordX} y={s.coordY} />
          </div>
        </div>

        {buffs.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {buffs.map((b) => (
              <BuffChip key={b.type} type={b.type} value={b.value} />
            ))}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <RoleSlot
            role="guardian"
            member={s.guardianId ? byId.get(s.guardianId) : undefined}
            canEdit={canEdit}
          />
          {/* Always show both governor slots; the 2nd is locked below L4. */}
          {[0, 1].map((i) => (
            <RoleSlot
              key={i}
              role="governor"
              member={
                governors[i] ? byId.get(governors[i] as string) : undefined
              }
              locked={i >= capacity}
              canEdit={canEdit}
            />
          ))}
        </div>

        {typeof s.deathRate === "number" ? (
          <div className="flex items-center justify-end border-t border-border pt-2">
            <span className="font-mono text-xs tabular-nums text-text-3">
              Death {s.deathRate}%
            </span>
          </div>
        ) : null}

        {s.opensAt && s.closesAt ? (
          <div className="border-t border-border pt-2">
            <OccupationWindow opensAt={s.opensAt} closesAt={s.closesAt} />
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
