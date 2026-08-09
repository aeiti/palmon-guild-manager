"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardBody, CardHead, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/layout/states";
import { RankBadge } from "@/components/domain/member/rank-badge";
import { AppRoleBadge } from "@/components/domain/member/app-role-badge";
import { StatusPill } from "@/components/domain/member/status-pill";
import { LastSeen } from "@/components/domain/member/last-seen";
import { SquadBadge } from "@/components/domain/member/squad-badge";
import { MemberChip } from "@/components/domain/member/member-chip";
import { MemberPicker } from "@/components/domain/member/member-picker";
import { Metric } from "@/components/domain/data/metric";
import { StatTile } from "@/components/domain/data/stat-tile";
import { DeltaIndicator } from "@/components/domain/data/delta-indicator";
import { DataTable, type Column } from "@/components/domain/data/data-table";
import { DistributionBar } from "@/components/domain/data/distribution-bar";
import { WarningItem } from "@/components/domain/data/warning-item";
import { ProgressBar } from "@/components/domain/data/progress-bar";
import { Sparkline } from "@/components/domain/data/sparkline";
import { AreaChart } from "@/components/domain/data/area-chart";
import { BarSeries } from "@/components/domain/data/bar-series";
import { ContributionScore } from "@/components/domain/kpi/contribution-score";
import { StreakBadge } from "@/components/domain/kpi/streak-badge";
import { TimezoneCoverage } from "@/components/domain/kpi/timezone-coverage";
import { contributionScore } from "@/lib/metrics";
import { TimePair } from "@/components/domain/time/time-pair";
import { EventBadge } from "@/components/domain/event/event-badge";
import { EventTypeIcon } from "@/components/domain/event/event-type-icon";
import { EventCard } from "@/components/domain/event/event-card";
import { ContributionBoard } from "@/components/domain/event/contribution-board";
import { ParticipationMatrix } from "@/components/domain/event/participation-matrix";
import type { EventType } from "@/lib/game/event";
import { Coords } from "@/components/domain/stronghold/coords";
import { ExpRate } from "@/components/domain/stronghold/exp-rate";
import { BuffChip } from "@/components/domain/stronghold/buff-chip";
import { RoleSlot } from "@/components/domain/stronghold/role-slot";
import { OccupationWindow } from "@/components/domain/stronghold/occupation-window";
import { BuffStack } from "@/components/domain/stronghold/buff-stack";
import { StrongholdCard } from "@/components/domain/stronghold/stronghold-card";
import type { Member } from "@/lib/game/types";
import { MOCK_MEMBERS } from "@/lib/mock/members";
import { MOCK_STRONGHOLDS } from "@/lib/mock/strongholds";
import {
  MOCK_CONTRIBUTIONS,
  MOCK_EVENTS,
  getContribution,
} from "@/lib/mock/events";

export interface RegistryEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  render: () => React.ReactNode;
}

export const CATEGORY_ORDER = [
  "Primitives",
  "Layout & State",
  "Member",
  "Data",
  "Stronghold",
  "Time",
  "Event",
  "KPI",
];

const SCORE_DEMO = contributionScore(
  {
    participationRate: 0.875,
    kills: 2_610_000,
    donations: 184_000,
    eventResults: 0.75,
  },
  { kills: 2_940_000, donations: 201_500 },
);

const ALL_EVENT_TYPES: EventType[] = [
  "guildHunt",
  "sandstorm",
  "guildDuel",
  "guildClash",
  "pallantis",
  "arcticShowdown",
];

const MATRIX_DEMO_EVENTS = [
  { id: "e-hunt", type: "guildHunt" as const },
  { id: "e-sandstorm", type: "sandstorm" as const },
  { id: "e-duel", type: "guildDuel" as const },
  { id: "e-pallantis", type: "pallantis" as const },
];

/** Small helpers to keep example blocks tidy. */
function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

function MemberPickerDemo() {
  const [value, setValue] = React.useState<string | null>("m-aeiti");
  return (
    <div className="w-72">
      <MemberPicker
        members={MOCK_MEMBERS}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}

function DataTableDemo() {
  const columns: Column<Member>[] = [
    {
      key: "member",
      header: "Member",
      cell: (m) => <MemberChip member={m} size="sm" />,
      sortValue: (m) => m.ign.toLowerCase(),
    },
    {
      key: "rank",
      header: "Rank",
      cell: (m) => <RankBadge rank={m.guildRank} guildmaster={m.isGuildmaster} />,
      sortValue: (m) => m.guildRank,
    },
    {
      key: "power",
      header: "Power",
      align: "right",
      cell: (m) => <Metric value={m.power} />,
      sortValue: (m) => m.power,
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={MOCK_MEMBERS.slice(0, 6)}
      getRowId={(m) => m.id}
      initialSort={{ key: "power", dir: "desc" }}
    />
  );
}

export const REGISTRY: RegistryEntry[] = [
  // ---- Primitives ----
  {
    id: "button",
    name: "Button",
    category: "Primitives",
    description: "primary / secondary / ghost / danger, sizes sm/md, icon slot.",
    render: () => (
      <div className="space-y-3">
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Row>
        <Row>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button disabled>Disabled</Button>
        </Row>
      </div>
    ),
  },
  {
    id: "badge",
    name: "Badge",
    category: "Primitives",
    description: "Base pill; tones follow the colour rules. Domain badges compose it.",
    render: () => (
      <Row>
        <Badge tone="neutral">Neutral</Badge>
        <Badge tone="outline">Outline</Badge>
        <Badge tone="violet">Violet</Badge>
        <Badge tone="desert">Desert</Badge>
        <Badge tone="good">Good</Badge>
        <Badge tone="warn">Warn</Badge>
        <Badge tone="bad">Bad</Badge>
      </Row>
    ),
  },
  {
    id: "avatar",
    name: "Avatar",
    category: "Primitives",
    description: "Radix avatar with mono initials fallback.",
    render: () => (
      <Row>
        <Avatar>
          <AvatarFallback>AE</AvatarFallback>
        </Avatar>
        <Avatar className="size-10">
          <AvatarFallback>KI</AvatarFallback>
        </Avatar>
      </Row>
    ),
  },
  {
    id: "input",
    name: "Input",
    category: "Primitives",
    description: "Text input with focus ring in violet.",
    render: () => (
      <div className="max-w-xs">
        <Input placeholder="Search members…" />
      </div>
    ),
  },
  {
    id: "tooltip",
    name: "Tooltip",
    category: "Primitives",
    description: "Radix tooltip, restyled surface.",
    render: () => (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    id: "skeleton",
    name: "Skeleton",
    category: "Primitives",
    description: "Pulse placeholder for loading states.",
    render: () => (
      <div className="max-w-sm space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ),
  },
  {
    id: "separator",
    name: "Separator",
    category: "Primitives",
    description: "Hairline divider, horizontal or vertical.",
    render: () => (
      <div className="max-w-sm">
        <p className="text-sm text-text-2">Above</p>
        <Separator className="my-3" />
        <p className="text-sm text-text-2">Below</p>
      </div>
    ),
  },
  {
    id: "card",
    name: "Card",
    category: "Primitives",
    description: "Card / CardHead / CardTitle / CardBody container.",
    render: () => (
      <Card className="max-w-sm">
        <CardHead>
          <CardTitle>Roster</CardTitle>
          <Badge tone="neutral">12</Badge>
        </CardHead>
        <CardBody>
          <p className="text-sm text-text-2">Card body content.</p>
        </CardBody>
      </Card>
    ),
  },

  // ---- Layout & State ----
  {
    id: "app-shell",
    name: "AppShell",
    category: "Layout & State",
    description:
      "Nav rail → mobile bottom bar, brand, clock, user chip. Normally full-viewport; framed here.",
    render: () => (
      <div className="h-[420px] overflow-hidden rounded-lg border border-border">
        <AppShell>
          <p className="text-sm text-text-2">
            Page content renders in this column.
          </p>
        </AppShell>
      </div>
    ),
  },
  {
    id: "page-header",
    name: "PageHeader",
    category: "Layout & State",
    description: "eyebrow / title / sub / actions.",
    render: () => (
      <PageHeader
        eyebrow="Roster"
        title="Members"
        sub="12 members · 1 guildmaster"
        actions={<Button size="sm">Export</Button>}
      />
    ),
  },
  {
    id: "section-title",
    name: "SectionTitle",
    category: "Layout & State",
    description: "Mono uppercase section label.",
    render: () => <SectionTitle>Needs attention</SectionTitle>,
  },
  {
    id: "empty-state",
    name: "EmptyState",
    category: "Layout & State",
    description: "No data yet — distinct from an error.",
    render: () => (
      <EmptyState
        title="No members yet"
        detail="Roster rows appear as members sign in with Discord."
        action={<Button size="sm">Add member</Button>}
      />
    ),
  },
  {
    id: "error-state",
    name: "ErrorState",
    category: "Layout & State",
    description: "A failed fetch — must not look like empty.",
    render: () => (
      <ErrorState detail="Could not load the roster. Try again." />
    ),
  },
  {
    id: "loading-state",
    name: "LoadingState",
    category: "Layout & State",
    description: "Stacked skeleton rows.",
    render: () => <LoadingState rows={4} />,
  },

  // ---- Member ----
  {
    id: "rank-badge",
    name: "RankBadge",
    category: "Member",
    description: "In-game R1–R5 as a brightness-tiered mono chip; guildmaster crown.",
    render: () => (
      <Row>
        <RankBadge rank={5} guildmaster />
        <RankBadge rank={4} />
        <RankBadge rank={3} />
        <RankBadge rank={2} />
        <RankBadge rank={1} />
      </Row>
    ),
  },
  {
    id: "app-role-badge",
    name: "AppRoleBadge",
    category: "Member",
    description: "App permission role — icon + word, distinct from RankBadge.",
    render: () => (
      <Row>
        <AppRoleBadge role="admin" source="env" />
        <AppRoleBadge role="officer" source="discord" />
        <AppRoleBadge role="member" />
      </Row>
    ),
  },
  {
    id: "status-pill",
    name: "StatusPill",
    category: "Member",
    description: "Derived activity tier — state colours.",
    render: () => (
      <Row>
        <StatusPill status="active" />
        <StatusPill status="idle" />
        <StatusPill status="inactive" />
      </Row>
    ),
  },
  {
    id: "last-seen",
    name: "LastSeen",
    category: "Member",
    description: "Renders the game bucket verbatim; hover for capture time.",
    render: () => (
      <Row>
        <LastSeen bucket={{ kind: "online" }} observedAt="2026-08-07T09:00:00Z" />
        <LastSeen bucket={{ kind: "minutes", n: 12 }} observedAt="2026-08-07T09:00:00Z" />
        <LastSeen bucket={{ kind: "hours", n: 6 }} observedAt="2026-08-07T09:00:00Z" />
        <LastSeen bucket={{ kind: "days", n: 2 }} observedAt="2026-08-07T09:00:00Z" />
        <LastSeen bucket={{ kind: "over", days: 7 }} observedAt="2026-08-07T09:00:00Z" />
        <LastSeen bucket={{ kind: "over", days: 30 }} observedAt="2026-08-07T09:00:00Z" />
      </Row>
    ),
  },
  {
    id: "squad-badge",
    name: "SquadBadge",
    category: "Member",
    description: "Skirmish Squad A / B; null renders an em dash.",
    render: () => (
      <Row>
        <SquadBadge squad="A" />
        <SquadBadge squad="B" />
        <SquadBadge squad={null} />
      </Row>
    ),
  },
  {
    id: "member-chip",
    name: "MemberChip",
    category: "Member",
    description: "The one way a member is referenced; sizes + optional rank.",
    render: () => (
      <div className="space-y-3">
        <Row>
          <MemberChip member={MOCK_MEMBERS[0]} showRank />
          <MemberChip member={MOCK_MEMBERS[1]} showRank />
        </Row>
        <Row>
          <MemberChip member={MOCK_MEMBERS[2]} size="sm" />
          <MemberChip member={MOCK_MEMBERS[4]} size="sm" />
        </Row>
      </div>
    ),
  },
  {
    id: "member-picker",
    name: "MemberPicker",
    category: "Member",
    description: "Combobox over the roster; supports exclude + filter.",
    render: () => <MemberPickerDemo />,
  },

  // ---- Data ----
  {
    id: "metric",
    name: "Metric",
    category: "Data",
    description: "The single number renderer — compact, full precision on hover.",
    render: () => (
      <div className="space-y-1 text-text">
        <div>
          <Metric value={1_880_000_000_000} /> ·{" "}
          <Metric value={421_300_000_000} /> · <Metric value={102_400_000} /> ·{" "}
          <Metric value={9_600} />
        </div>
        <div>
          <Metric value={0.734} format="percent" /> ·{" "}
          <Metric value={2_780_000_000} format="compact" /> power
        </div>
      </div>
    ),
  },
  {
    id: "stat-tile",
    name: "StatTile",
    category: "Data",
    description: "Dashboard/KPI tile; value + optional unit, foot, accent, spark.",
    render: () => (
      <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Members" value={<Metric value={12} format="full" />} />
        <StatTile
          label="Avg power"
          value={<Metric value={1_540_000_000} />}
          accent="violet"
          foot="across 12 members"
        />
        <StatTile
          label="Sanctum EXP"
          value={<Metric value={5700} format="full" />}
          unit="/h"
          accent="desert"
        />
      </div>
    ),
  },
  {
    id: "delta-indicator",
    name: "DeltaIndicator",
    category: "Data",
    description: "▲/▼ change; `inverted` for metrics where lower is better.",
    render: () => (
      <div className="flex flex-wrap items-center gap-4">
        <DeltaIndicator value={12_000_000} direction="up" />
        <DeltaIndicator value={3_400_000} direction="down" />
        <DeltaIndicator value={0} direction="flat" />
        <span className="text-xs text-text-3">rank (inverted):</span>
        <DeltaIndicator value={2} direction="up" inverted format="full" />
        <DeltaIndicator value={1} direction="down" inverted format="full" />
      </div>
    ),
  },
  {
    id: "data-table",
    name: "DataTable",
    category: "Data",
    description: "Sortable table — click a header. Sticky header, scrolls x.",
    render: () => <DataTableDemo />,
  },
  {
    id: "progress-bar",
    name: "ProgressBar",
    category: "Data",
    description: "Proportional bar, clamped 0–100%, variant-coloured.",
    render: () => (
      <div className="max-w-sm space-y-2">
        <ProgressBar value={70} max={100} />
        <ProgressBar value={45} max={100} variant="desert" />
        <ProgressBar value={100} max={100} variant="good" />
      </div>
    ),
  },
  {
    id: "sparkline",
    name: "Sparkline",
    category: "Data",
    description: "Tiny trend line with an emphasised endpoint. Inline SVG.",
    render: () => (
      <Sparkline data={[44, 45, 46, 47, 47, 48, 49, 49]} width={160} height={40} />
    ),
  },
  {
    id: "area-chart",
    name: "AreaChart",
    category: "Data",
    description: "Area + line + faint grid; responsive; optional x labels.",
    render: () => (
      <div className="max-w-md">
        <AreaChart
          data={[820, 910, 880, 1040, 1120, 1080, 1210, 1290]}
          labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]}
        />
      </div>
    ),
  },
  {
    id: "bar-series",
    name: "BarSeries",
    category: "Data",
    description: "Vertical bars, tallest emphasised. Violet or desert.",
    render: () => (
      <div className="max-w-md">
        <BarSeries
          data={[21, 24, 19, 28, 31, 26, 34, 36].map((v, i) => ({
            label: `W${i + 1}`,
            value: v,
          }))}
        />
      </div>
    ),
  },
  {
    id: "distribution-bar",
    name: "DistributionBar",
    category: "Data",
    description: "Stacked proportional bar + legend — the R5→R1 rank split.",
    render: () => (
      <div className="max-w-md">
        <DistributionBar
          segments={[
            { key: "R5", label: "R5", value: 1, color: "bg-rank-5" },
            { key: "R4", label: "R4", value: 3, color: "bg-rank-4" },
            { key: "R3", label: "R3", value: 3, color: "bg-rank-3" },
            { key: "R2", label: "R2", value: 2, color: "bg-rank-2" },
            { key: "R1", label: "R1", value: 3, color: "bg-rank-1" },
          ]}
        />
      </div>
    ),
  },
  {
    id: "warning-item",
    name: "WarningItem",
    category: "Data",
    description: "Severity stripe + text; feeds 'Needs Attention'.",
    render: () => (
      <div className="max-w-md space-y-1.5">
        <WarningItem
          severity="critical"
          title="Guardian unassigned — Goldglade Shrine"
          detail="L4"
        />
        <WarningItem
          severity="warning"
          title="2 governor slots open — Goldglade Shrine"
        />
        <WarningItem
          severity="info"
          title="Steelstory Shrine opens soon"
          detail="occupation window about to open"
        />
      </div>
    ),
  },

  // ---- Time ----
  {
    id: "time-pair",
    name: "TimePair",
    category: "Time",
    description: "The only way an event time renders — server (UTC−2) + local.",
    render: () => {
      const t = Date.now();
      const iso = (h: number) => new Date(t + h * 3_600_000).toISOString();
      return (
        <div className="space-y-1">
          <div>
            <TimePair serverTime={iso(3)} />
          </div>
          <div>
            <TimePair serverTime={iso(26)} />
          </div>
        </div>
      );
    },
  },

  // ---- Stronghold ----
  {
    id: "coords",
    name: "Coords",
    category: "Stronghold",
    description: "Map coordinates, mono.",
    render: () => <Coords x={485} y={602} />,
  },
  {
    id: "exp-rate",
    name: "ExpRate",
    category: "Stronghold",
    description: "Desert EXP/h in reserved amber.",
    render: () => (
      <Row>
        <ExpRate perHour={1500} />
        <ExpRate perHour={9600} />
      </Row>
    ),
  },
  {
    id: "buff-chip",
    name: "BuffChip",
    category: "Stronghold",
    description: "One buff; amber, but a 0 value reads red (a gap is info).",
    render: () => (
      <Row>
        <BuffChip type="gold" value={45} />
        <BuffChip type="harvesting" value={70} />
        <BuffChip type="lumber" value={0} />
      </Row>
    ),
  },
  {
    id: "role-slot",
    name: "RoleSlot",
    category: "Stronghold",
    description: "Filled / empty (+Assign) / locked (governor unlocks at L4).",
    render: () => (
      <div className="w-64 space-y-2">
        <RoleSlot role="guardian" member={MOCK_MEMBERS[0]} />
        <RoleSlot role="governor" canEdit />
        <RoleSlot role="governor" />
        <RoleSlot role="governor" locked />
      </div>
    ),
  },
  {
    id: "occupation-window",
    name: "OccupationWindow",
    category: "Stronghold",
    description: "Open/closed with a live countdown to the next transition.",
    render: () => {
      const t = Date.now();
      const iso = (h: number) => new Date(t + h * 3_600_000).toISOString();
      return (
        <div className="space-y-2">
          <OccupationWindow opensAt={iso(-1)} closesAt={iso(2)} />
          <OccupationWindow opensAt={iso(3)} closesAt={iso(9)} />
          <OccupationWindow opensAt={iso(-5)} closesAt={iso(-1)} />
        </div>
      );
    },
  },
  {
    id: "buff-stack",
    name: "BuffStack",
    category: "Stronghold",
    description: "Computed additive totals across sanctums; gaps read red.",
    render: () => <BuffStack strongholds={MOCK_STRONGHOLDS} />,
  },
  {
    id: "stronghold-card",
    name: "StrongholdCard",
    category: "Stronghold",
    description: "Sanctum (full) and desert ruin (minimal) variants.",
    render: () => (
      <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
        <StrongholdCard
          stronghold={MOCK_STRONGHOLDS[0]}
          members={MOCK_MEMBERS}
          canEdit
        />
        <StrongholdCard
          stronghold={MOCK_STRONGHOLDS[3]}
          members={MOCK_MEMBERS}
          canEdit
        />
        <StrongholdCard
          stronghold={MOCK_STRONGHOLDS[6]}
          members={MOCK_MEMBERS}
        />
      </div>
    ),
  },

  // ---- Event ----
  {
    id: "event-type-icon",
    name: "EventTypeIcon",
    category: "Event",
    description: "Hand-drawn glyph + categorical colour, one per event type.",
    render: () => (
      <div className="flex flex-wrap items-center gap-4">
        {ALL_EVENT_TYPES.map((t) => (
          <EventTypeIcon key={t} type={t} className="size-7" />
        ))}
      </div>
    ),
  },
  {
    id: "event-badge",
    name: "EventBadge",
    category: "Event",
    description: "Icon + label pill, tinted with the event type's colour.",
    render: () => (
      <div className="flex flex-wrap gap-2">
        {ALL_EVENT_TYPES.map((t) => (
          <EventBadge key={t} type={t} />
        ))}
      </div>
    ),
  },
  {
    id: "event-card",
    name: "EventCard",
    category: "Event",
    description: "Shell + a per-type body rendering that event's real fields.",
    render: () => (
      <div className="grid max-w-3xl gap-3 md:grid-cols-2">
        {MOCK_EVENTS.slice(0, 4).map((e) => (
          <EventCard key={e.id} event={e} members={MOCK_MEMBERS} />
        ))}
      </div>
    ),
  },
  {
    id: "contribution-board",
    name: "ContributionBoard",
    category: "Event",
    description: "Ranked per-member contribution for one event; MVP + sub-scores.",
    render: () => (
      <div className="max-w-md">
        <ContributionBoard
          entries={MOCK_CONTRIBUTIONS["e-hunt"]}
          members={MOCK_MEMBERS}
          metric="damage"
        />
      </div>
    ),
  },
  {
    id: "participation-matrix",
    name: "ParticipationMatrix",
    category: "Event",
    description: "Members × events, contributed values; non-participation = dash.",
    render: () => (
      <ParticipationMatrix
        members={MOCK_MEMBERS.slice(0, 8)}
        events={MATRIX_DEMO_EVENTS}
        getValue={getContribution}
      />
    ),
  },

  // ---- KPI ----
  {
    id: "contribution-score",
    name: "ContributionScore",
    category: "KPI",
    description: "Weighted composite (participation ≫ kills > donations); breakdown.",
    render: () => (
      <div className="max-w-xs">
        <ContributionScore
          score={SCORE_DEMO.score}
          breakdown={SCORE_DEMO.breakdown}
          size="lg"
        />
      </div>
    ),
  },
  {
    id: "streak-badge",
    name: "StreakBadge",
    category: "KPI",
    description: "Consecutive events contributed to; active = good, broken = muted.",
    render: () => (
      <Row>
        <StreakBadge count={8} active />
        <StreakBadge count={3} active />
        <StreakBadge count={5} active={false} />
        <StreakBadge count={0} active={false} />
      </Row>
    ),
  },
  {
    id: "timezone-coverage",
    name: "TimezoneCoverage",
    category: "KPI",
    description: "24h band in server time; bar height = members online; red = gap.",
    render: () => (
      <div className="max-w-lg">
        <TimezoneCoverage members={MOCK_MEMBERS} />
      </div>
    ),
  },
];

export function getEntry(id: string): RegistryEntry | undefined {
  return REGISTRY.find((e) => e.id === id);
}
