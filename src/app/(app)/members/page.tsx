import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/domain/data/stat-tile";
import { Metric } from "@/components/domain/data/metric";
import { activityFromBucket } from "@/lib/game/last-seen";
import { getMembers } from "@/lib/data/queries";
import { MembersTable } from "./members-table";

export const metadata = { title: "Members — VOID" };
export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await getMembers();
  const total = members.length;
  const guildmasters = members.filter((m) => m.isGuildmaster).length;
  const active = members.filter(
    (m) => activityFromBucket(m.lastSeen) === "active",
  ).length;
  const onSquad = members.filter((m) => m.sandstormSquad !== null).length;
  const avgPower =
    members.reduce((sum, m) => sum + m.power, 0) / (total || 1);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Roster"
        title="Members"
        sub={`${total} members · ${guildmasters} guildmaster`}
        actions={
          <Button size="sm" variant="secondary">
            Export JSON
          </Button>
        }
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
          label="On a squad"
          value={<Metric value={onSquad} format="full" />}
          foot={`${total - onSquad} unassigned`}
        />
        <StatTile
          label="Avg power"
          value={<Metric value={avgPower} />}
          accent="violet"
        />
      </div>

      <MembersTable members={members} />
    </div>
  );
}
