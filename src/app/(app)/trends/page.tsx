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
import {
  contributionScore,
  participationRate,
  streak,
} from "@/lib/metrics";
import { MOCK_MEMBERS } from "@/lib/mock/members";
import { MOCK_CONTRIBUTIONS } from "@/lib/mock/events";
import {
  AVG_POWER_TREND,
  DONATIONS_TREND,
  KILLS_TREND,
  MOCK_PARTICIPATION_HISTORY,
  ROSTER_SIZE_TREND,
  SANDSTORM_POINTS_TREND,
  SANDSTORM_RECORD,
  TREND_WEEKS,
} from "@/lib/mock/trends";

export const metadata = { title: "Trends — VOID" };

/** Share of contribution boards where the member finished top-3. */
function eventResults(memberId: string): number {
  const ids = Object.keys(MOCK_CONTRIBUTIONS);
  if (ids.length === 0) return 0;
  let top3 = 0;
  for (const id of ids) {
    const sorted = [...MOCK_CONTRIBUTIONS[id]].sort((a, b) => b.value - a.value);
    const idx = sorted.findIndex((e) => e.memberId === memberId);
    if (idx >= 0 && idx < 3) top3 += 1;
  }
  return top3 / ids.length;
}

export default function TrendsPage() {
  const roster = MOCK_MEMBERS;
  const maxKills = Math.max(...roster.map((m) => m.kills));
  const maxDonations = Math.max(...roster.map((m) => m.donations));

  const scored = roster
    .map((member) => {
      const history = MOCK_PARTICIPATION_HISTORY[member.id] ?? [];
      const pr = participationRate(history);
      const st = streak(history);
      const { score, breakdown } = contributionScore(
        {
          participationRate: pr,
          kills: member.kills,
          donations: member.donations,
          eventResults: eventResults(member.id),
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
          foot="guild avg, last 8 events"
        />
        <StatTile
          label="Roster size"
          value={<Metric value={ROSTER_SIZE_TREND.at(-1)!} format="full" />}
          spark={<Sparkline data={ROSTER_SIZE_TREND} />}
        />
        <StatTile
          label="Avg power"
          value={<Metric value={AVG_POWER_TREND.at(-1)!} />}
          accent="violet"
          spark={<Sparkline data={AVG_POWER_TREND} />}
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
            <Metric value={DONATIONS_TREND.at(-1)!} className="text-sm text-text-2" />
          </CardHead>
          <CardBody>
            <AreaChart data={DONATIONS_TREND} labels={TREND_WEEKS} />
          </CardBody>
        </Card>
        <Card>
          <CardHead>
            <CardTitle>Kills / week</CardTitle>
            <Metric value={KILLS_TREND.at(-1)!} className="text-sm text-text-2" />
          </CardHead>
          <CardBody>
            <AreaChart data={KILLS_TREND} labels={TREND_WEEKS} />
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
              data={SANDSTORM_POINTS_TREND.map((v, i) => ({
                label: TREND_WEEKS[i],
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
                <StreakBadge count={top.streak.count} active={top.streak.active} />
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
                    className={cnRank(i)}
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

function cnRank(i: number): string {
  return `w-5 text-right font-mono text-xs tabular-nums ${
    i < 3 ? "text-text" : "text-text-3"
  }`;
}
