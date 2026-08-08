import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Card, CardBody, CardHead, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/domain/data/stat-tile";
import { Metric } from "@/components/domain/data/metric";
import { Sparkline } from "@/components/domain/data/sparkline";
import { AreaChart } from "@/components/domain/data/area-chart";
import { BarSeries } from "@/components/domain/data/bar-series";
import { MemberChip } from "@/components/domain/member/member-chip";
import { ContributionScore } from "@/components/domain/kpi/contribution-score";
import { StreakBadge } from "@/components/domain/kpi/streak-badge";
import { TimezoneCoverage } from "@/components/domain/kpi/timezone-coverage";
import { contributionScore, participationRate, streak } from "@/lib/metrics";
import type { ContributionEntry } from "@/lib/game/event";
import {
  getContributionsMap,
  getEvents,
  getMembers,
  getWeeklySnapshots,
} from "@/lib/data/queries";

export const metadata = { title: "Trends" };
export const dynamic = "force-dynamic";

// Season sandstorm record — not yet modelled as a table; a single aggregate.
const SANDSTORM_RECORD = { wins: 6, losses: 2 };

/** Share of contribution boards where the member finished top-3. */
function eventResults(
  memberId: string,
  contribMap: Record<string, ContributionEntry[]>,
): number {
  const ids = Object.keys(contribMap);
  if (ids.length === 0) return 0;
  let top3 = 0;
  for (const id of ids) {
    const idx = [...contribMap[id]]
      .sort((a, b) => b.value - a.value)
      .findIndex((e) => e.memberId === memberId);
    if (idx >= 0 && idx < 3) top3 += 1;
  }
  return top3 / ids.length;
}

export default async function TrendsPage() {
  const [roster, contribMap, events, snapshots] = await Promise.all([
    getMembers(),
    getContributionsMap(),
    getEvents(),
    getWeeklySnapshots(),
  ]);

  // Weekly series from the snapshot table.
  const weeks = snapshots.map((s) => s.week);
  const donationsTrend = snapshots.map((s) => s.donations);
  const killsTrend = snapshots.map((s) => s.kills);
  const rosterTrend = snapshots.map((s) => s.rosterSize);
  const powerTrend = snapshots.map((s) => s.avgPower);
  const sandstormTrend = snapshots.map((s) => s.sandstormPoints);

  // Participation history = did the member contribute to each board event
  // (ordered oldest→newest), derived from the contribution boards.
  const boardEvents = events.filter((e) => contribMap[e.id]);
  const historyFor = (memberId: string) =>
    boardEvents.map((e) =>
      (contribMap[e.id] ?? []).some((c) => c.memberId === memberId),
    );

  const maxKills = Math.max(...roster.map((m) => m.kills), 1);
  const maxDonations = Math.max(...roster.map((m) => m.donations), 1);

  const scored = roster
    .map((member) => {
      const history = historyFor(member.id);
      const pr = participationRate(history);
      const st = streak(history);
      const { score, breakdown } = contributionScore(
        {
          participationRate: pr,
          kills: member.kills,
          donations: member.donations,
          eventResults: eventResults(member.id, contribMap),
        },
        { kills: maxKills, donations: maxDonations },
      );
      return { member, pr, streak: st, score, breakdown };
    })
    .sort((a, b) => b.score - a.score);

  const avgParticipation =
    scored.reduce((s, r) => s + r.pr, 0) / (scored.length || 1);
  const winRate =
    SANDSTORM_RECORD.wins /
    (SANDSTORM_RECORD.wins + SANDSTORM_RECORD.losses || 1);
  const top = scored[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="History"
        title="Trends"
        sub="8-week view · participation, economy, and defense readiness"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Participation"
          value={<Metric value={avgParticipation} format="percent" />}
          accent="good"
          foot={`guild avg, last ${boardEvents.length} events`}
        />
        <StatTile
          label="Roster size"
          value={<Metric value={rosterTrend.at(-1) ?? 0} format="full" />}
          spark={<Sparkline data={rosterTrend} />}
        />
        <StatTile
          label="Avg power"
          value={<Metric value={powerTrend.at(-1) ?? 0} />}
          accent="violet"
          spark={<Sparkline data={powerTrend} />}
        />
        <StatTile
          label="Sandstorm win %"
          value={<Metric value={winRate} format="percent" />}
          foot={`${SANDSTORM_RECORD.wins}W · ${SANDSTORM_RECORD.losses}L`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead>
            <CardTitle>Donations / week</CardTitle>
            <Metric
              value={donationsTrend.at(-1) ?? 0}
              className="text-sm text-text-2"
            />
          </CardHead>
          <CardBody>
            <AreaChart data={donationsTrend} labels={weeks} />
          </CardBody>
        </Card>
        <Card>
          <CardHead>
            <CardTitle>Kills / week</CardTitle>
            <Metric
              value={killsTrend.at(-1) ?? 0}
              className="text-sm text-text-2"
            />
          </CardHead>
          <CardBody>
            <AreaChart data={killsTrend} labels={weeks} />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead>
            <CardTitle>24-hour coverage</CardTitle>
          </CardHead>
          <CardBody>
            <TimezoneCoverage members={roster} />
          </CardBody>
        </Card>
        <Card>
          <CardHead>
            <CardTitle>Sandstorm points / week</CardTitle>
          </CardHead>
          <CardBody>
            <BarSeries
              data={sandstormTrend.map((v, i) => ({
                label: weeks[i],
                value: v,
              }))}
            />
          </CardBody>
        </Card>
      </div>

      <section className="space-y-3">
        <SectionTitle>Contribution leaderboard</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-3">
          {top ? (
            <Card>
              <CardHead>
                <CardTitle>Top contributor</CardTitle>
                <StreakBadge
                  count={top.streak.count}
                  active={top.streak.active}
                />
              </CardHead>
              <CardBody className="space-y-3">
                <MemberChip member={top.member} showRank />
                <ContributionScore
                  score={top.score}
                  breakdown={top.breakdown}
                  size="lg"
                />
              </CardBody>
            </Card>
          ) : null}

          <Card className="lg:col-span-2">
            <CardHead>
              <CardTitle>Ranked by contribution score</CardTitle>
            </CardHead>
            <CardBody className="space-y-1">
              {scored.map((r, i) => (
                <div
                  key={r.member.id}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-surface-2/50"
                >
                  <span
                    className={`w-5 text-right font-mono text-xs tabular-nums ${
                      i < 3 ? "text-text" : "text-text-3"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <MemberChip member={r.member} size="sm" showRank />
                  <div className="ml-auto flex items-center gap-3">
                    <StreakBadge
                      count={r.streak.count}
                      active={r.streak.active}
                    />
                    <span className="w-9 text-right font-mono text-xs tabular-nums text-text-3">
                      {Math.round(r.pr * 100)}%
                    </span>
                    <span className="w-8 text-right font-mono text-sm font-semibold tabular-nums text-text">
                      {r.score}
                    </span>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}
