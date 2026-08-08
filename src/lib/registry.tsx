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
import { MOCK_MEMBERS } from "@/lib/mock/members";

export interface RegistryEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  render: () => React.ReactNode;
}

export const CATEGORY_ORDER = ["Primitives", "Layout & State", "Member"];

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
];

export function getEntry(id: string): RegistryEntry | undefined {
  return REGISTRY.find((e) => e.id === id);
}
