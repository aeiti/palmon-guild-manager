import { cn } from "@/lib/utils";
import type { Member } from "@/lib/game/types";
import {
  DUEL_THEMES,
  PALLANTIS_PHASE_LABEL,
  type ArcticShowdownFields,
  type GuildClashFields,
  type GuildDuelFields,
  type GuildEvent,
  type GuildHuntFields,
  type PallantisFields,
  type PallantisPhase,
  type SandstormFields,
} from "@/lib/game/event";
import { Metric } from "@/components/domain/data/metric";
import { ProgressBar } from "@/components/domain/data/progress-bar";
import { MemberChip } from "@/components/domain/member/member-chip";
import { SquadBadge } from "@/components/domain/member/squad-badge";

/** A small labelled value used across bodies. */
function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="font-mono text-[0.6rem] uppercase tracking-wide text-text-3">
        {label}
      </div>
      <div className="text-sm text-text">{children}</div>
    </div>
  );
}

function ResultPill({ result }: { result: "win" | "loss" | "pending" }) {
  const map = {
    win: "text-good",
    loss: "text-bad",
    pending: "text-text-3",
  } as const;
  const label = { win: "Win", loss: "Loss", pending: "Pending" }[result];
  return (
    <span className={cn("font-mono text-xs uppercase tracking-wide", map[result])}>
      {label}
    </span>
  );
}

function GuildHuntBody({
  fields,
  members,
}: {
  fields: GuildHuntFields;
  members: Member[];
}) {
  const mvp = fields.mvpMemberId
    ? members.find((m) => m.id === fields.mvpMemberId)
    : undefined;
  const unlocked = fields.totalDamage >= fields.threshold;
  const multiple = Math.floor(fields.totalDamage / (fields.threshold || 1));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-2">{fields.boss}</span>
        <span className="rounded-md border border-border-2 bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-text-2">
          Trap L{fields.trapLevel}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[0.6rem] uppercase tracking-wide text-text-3">
            Total damage
          </span>
          <Metric value={fields.totalDamage} className="text-sm text-text" />
        </div>
        <ProgressBar
          value={fields.totalDamage}
          max={fields.threshold}
          variant={unlocked ? "good" : "violet"}
        />
        <div className="flex justify-between font-mono text-[0.6rem] text-text-3">
          <span>
            threshold <Metric value={fields.threshold} />
          </span>
          {unlocked ? (
            <span className="text-good">unlocked · ×{multiple} over</span>
          ) : null}
        </div>
      </div>
      {mvp ? (
        <div className="flex items-center gap-2 text-xs text-text-3">
          <span className="font-mono uppercase tracking-wide">MVP ×10</span>
          <MemberChip member={mvp} size="sm" />
        </div>
      ) : null}
    </div>
  );
}

function SandstormBody({
  fields,
  opponent,
}: {
  fields: SandstormFields;
  opponent?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <SquadBadge squad={fields.squad} />
        <ResultPill result={fields.result} />
        <span className="text-xs text-text-3">40-min battle</span>
      </div>
      <div className="flex items-center gap-4">
        <Stat label="Guild pts">
          <Metric value={fields.guildPoints} />
        </Stat>
        <span className="text-text-3">:</span>
        <Stat label={opponent ?? "Opponent"}>
          <Metric value={fields.opponentPoints} />
        </Stat>
      </div>
    </div>
  );
}

function GuildDuelBody({
  fields,
  opponent,
}: {
  fields: GuildDuelFields;
  opponent?: string;
}) {
  const todayTheme = DUEL_THEMES.find((d) => d.day === fields.today);
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <Stat label="Weekly tally">
          <span className="font-mono tabular-nums">
            {fields.us}:{fields.them}
          </span>
        </Stat>
        {opponent ? (
          <span className="text-xs text-text-3">vs {opponent}</span>
        ) : null}
      </div>
      <div className="grid grid-cols-6 gap-1">
        {DUEL_THEMES.map((d) => (
          <div
            key={d.day}
            title={d.theme}
            className={cn(
              "rounded border px-1 py-1 text-center",
              d.day === fields.today
                ? "border-violet/40 bg-violet/10"
                : "border-border bg-surface",
            )}
          >
            <div className="font-mono text-[0.6rem] uppercase text-text-3">
              {d.day}
            </div>
            <div className="font-mono text-xs tabular-nums text-text">
              {d.victoryPoints}
            </div>
          </div>
        ))}
      </div>
      {todayTheme ? (
        <p className="text-xs text-text-2">
          Today · {todayTheme.theme}{" "}
          <span className="text-text-3">
            ({todayTheme.victoryPoints} VP)
          </span>
        </p>
      ) : null}
    </div>
  );
}

function GuildClashBody({ fields }: { fields: GuildClashFields }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      <Stat label="Tier">{fields.tier}</Stat>
      <Stat label="Rank">
        <span className="font-mono tabular-nums">#{fields.rank}</span>
      </Stat>
      <Stat label="Week">
        <span className="font-mono tabular-nums">{fields.week}/4</span>
      </Stat>
      <Stat label="Guild points">
        <Metric value={fields.points} />
      </Stat>
    </div>
  );
}

const PALLANTIS_PHASES: PallantisPhase[] = [
  "prep",
  "invasionPrep",
  "battle",
  "settlement",
];

function PallantisBody({
  fields,
  opponent,
}: {
  fields: PallantisFields;
  opponent?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {PALLANTIS_PHASES.map((p) => (
          <span
            key={p}
            className={cn(
              "rounded border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wide",
              p === fields.phase
                ? "border-violet/40 bg-violet/10 text-violet"
                : "border-border bg-surface text-text-3",
            )}
          >
            {PALLANTIS_PHASE_LABEL[p]}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4">
        {opponent ? (
          <span className="text-xs text-text-3">vs {opponent}</span>
        ) : null}
        {fields.result ? <ResultPill result={fields.result} /> : null}
        {typeof fields.templePoints === "number" ? (
          <Stat label="Temple pts">
            <Metric value={fields.templePoints} />
          </Stat>
        ) : null}
      </div>
    </div>
  );
}

function ArcticShowdownBody({ fields }: { fields: ArcticShowdownFields }) {
  const stageLabel = {
    registration: "Registration",
    qualifiers: "Qualifiers",
    knockout: "Knockout",
    unknown: "Unknown",
  }[fields.stage];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <Stat label="Stage">{stageLabel}</Stat>
        {typeof fields.defendersPicked === "number" ? (
          <Stat label="Defenders">
            <span className="font-mono tabular-nums">
              {fields.defendersPicked}
            </span>
          </Stat>
        ) : null}
        {typeof fields.placement === "number" ? (
          <Stat label="Placement">
            <span className="font-mono tabular-nums">#{fields.placement}</span>
          </Stat>
        ) : null}
      </div>
      {/* No contribution board captured yet — render the unknown state
          explicitly rather than invent a metric (open thread §4). */}
      <div className="rounded-md border border-dashed border-border-2 px-3 py-2 text-xs text-text-3">
        Roster & bracket not captured yet — per-member metric TBD.
      </div>
    </div>
  );
}

/** Routes an event to the body that renders its real fields (docs/components.md
 * §3.4, PLAN §4a). typeFields is typed, so each body reads its own shape. */
export function EventBody({
  event,
  members,
}: {
  event: GuildEvent;
  members: Member[];
}) {
  switch (event.type) {
    case "guildHunt":
      return <GuildHuntBody fields={event.fields} members={members} />;
    case "sandstorm":
      return <SandstormBody fields={event.fields} opponent={event.opponent} />;
    case "guildDuel":
      return <GuildDuelBody fields={event.fields} opponent={event.opponent} />;
    case "guildClash":
      return <GuildClashBody fields={event.fields} />;
    case "pallantis":
      return <PallantisBody fields={event.fields} opponent={event.opponent} />;
    case "arcticShowdown":
      return <ArcticShowdownBody fields={event.fields} />;
  }
}
