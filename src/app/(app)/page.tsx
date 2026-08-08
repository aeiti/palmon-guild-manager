import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHead, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/domain/data/stat-tile";
import { Metric } from "@/components/domain/data/metric";
import {
  DistributionBar,
  type DistributionSegment,
} from "@/components/domain/data/distribution-bar";
import { WarningItem, type Severity } from "@/components/domain/data/warning-item";
import { BuffStack } from "@/components/domain/stronghold/buff-stack";
import { MemberChip } from "@/components/domain/member/member-chip";
import { TimePair } from "@/components/domain/time/time-pair";
import { EventBadge } from "@/components/domain/event/event-badge";
import {
  governorCapacity,
  totalExpPerHour,
  type Stronghold,
} from "@/lib/game/stronghold";
import { activityFromBucket } from "@/lib/game/last-seen";
import type { GuildRank } from "@/lib/game/types";
import { getEvents, getMembers, getStrongholds } from "@/lib/data/queries";

export const metadata = { title: "Dashboard — VOID" };
export const dynamic = "force-dynamic";

const RANK_COLOR: Record<GuildRank, string> = {
  5: "bg-rank-5",
  4: "bg-rank-4",
  3: "bg-rank-3",
  2: "bg-rank-2",
  1: "bg-rank-1",
};

type Warning = {
  severity: Severity;
  title: string;
  detail?: string;
  href?: string;
};

function buildWarnings(strongholds: Stronghold[]): Warning[] {
  const now = Date.now();
  const out: Warning[] = [];
  for (const s of strongholds) {
    if (s.category !== "sanctum") continue;
    if (!s.guardianId) {
      out.push({
        severity: "critical",
        title: `Guardian unassigned — ${s.name}`,
        detail: `L${s.level}`,
        href: "/strongholds",
      });
    }
    const cap = governorCapacity(s.level);
    const openGov = (s.governorIds ?? []).slice(0, cap).filter((g) => !g).length;
    if (openGov > 0) {
      out.push({
        severity: "warning",
        title: `${openGov} governor slot${openGov > 1 ? "s" : ""} open — ${s.name}`,
        href: "/strongholds",
      });
    }
    if ((s.sentryIds ?? []).filter(Boolean).length === 0) {
      out.push({
        severity: "warning",
        title: `No sentries — ${s.name}`,
        href: "/strongholds",
      });
    }
    if (s.opensAt) {
      const o = new Date(s.opensAt).getTime();
      if (o > now && o - now < 3 * 3_600_000) {
        out.push({
          severity: "info",
          title: `${s.name} opens soon`,
          detail: "occupation window about to open",
          href: "/strongholds",
        });
      }
    }
  }
  return out;
}

export default async function DashboardPage() {
  const [members, strongholds, allEvents] = await Promise.all([
    getMembers(),
    getStrongholds(),
    getEvents(),
  ]);
  const upcoming = allEvents
    .filter((e) => e.status === "upcoming")
    .slice(0, 4);
  const total = members.length;
  const active = members.filter(
    (m) => activityFromBucket(m.lastSeen) === "active",
  ).length;
  const avgPower = members.reduce((s, m) => s + m.power, 0) / (total || 1);
  const totalExp = totalExpPerHour(strongholds);

  const rankSegments: DistributionSegment[] = ([5, 4, 3, 2, 1] as GuildRank[]).map(
    (r) => ({
      key: `R${r}`,
      label: `R${r}`,
      value: members.filter((m) => m.guildRank === r).length,
      color: RANK_COLOR[r],
    }),
  );

  const warnings = buildWarnings(strongholds);
  const topDonors = [...members]
    .sort((a, b) => b.donations - a.donations)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        sub="VOID · Palmon: Survival · Server #111"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Members" value={<Metric value={total} format="full" />} />
        <StatTile
          label="Active"
          value={<Metric value={active} format="full" />}
          accent="good"
          foot={`${total - active} idle or inactive`}
        />
        <StatTile
          label="Total EXP"
          value={<Metric value={totalExp} format="full" />}
          unit="/h"
          accent="desert"
        />
        <StatTile
          label="Avg power"
          value={<Metric value={avgPower} />}
          accent="violet"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHead>
              <CardTitle>Rank distribution</CardTitle>
              <Link
                href="/members"
                className="font-mono text-xs text-violet hover:underline"
              >
                Members →
              </Link>
            </CardHead>
            <CardBody>
              <DistributionBar segments={rankSegments} />
            </CardBody>
          </Card>

          <Card>
            <CardHead>
              <CardTitle>Active buff stack</CardTitle>
              <Link
                href="/strongholds"
                className="font-mono text-xs text-violet hover:underline"
              >
                Strongholds →
              </Link>
            </CardHead>
            <CardBody>
              <BuffStack strongholds={strongholds} />
            </CardBody>
          </Card>

          <Card>
            <CardHead>
              <CardTitle>Top donations</CardTitle>
            </CardHead>
            <CardBody className="space-y-2">
              {topDonors.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3"
                >
                  <MemberChip member={m} size="sm" showRank />
                  <Metric
                    value={m.donations}
                    className="text-sm text-text-2"
                  />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHead>
              <CardTitle>Needs attention</CardTitle>
              <Badge tone={warnings.length ? "warn" : "good"}>
                {warnings.length}
              </Badge>
            </CardHead>
            <CardBody className="space-y-1.5">
              {warnings.length === 0 ? (
                <p className="text-sm text-text-3">All clear.</p>
              ) : (
                warnings
                  .slice(0, 8)
                  .map((w, i) => (
                    <WarningItem
                      key={i}
                      severity={w.severity}
                      title={w.title}
                      detail={w.detail}
                      href={w.href}
                    />
                  ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHead>
              <CardTitle>Upcoming events</CardTitle>
              <Link
                href="/events"
                className="font-mono text-xs text-violet hover:underline"
              >
                Events →
              </Link>
            </CardHead>
            <CardBody className="space-y-2">
              {upcoming.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <EventBadge type={e.type} short />
                    <span className="truncate text-sm text-text-2">
                      {e.title}
                    </span>
                  </div>
                  <TimePair serverTime={e.startsAt} />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
