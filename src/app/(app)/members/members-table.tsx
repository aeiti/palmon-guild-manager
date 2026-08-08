"use client";

import type { Member } from "@/lib/game/types";
import { activityFromBucket, bucketSortValue } from "@/lib/game/last-seen";
import { DataTable, type Column } from "@/components/domain/data/data-table";
import { Metric } from "@/components/domain/data/metric";
import { MemberChip } from "@/components/domain/member/member-chip";
import { RankBadge } from "@/components/domain/member/rank-badge";
import { SquadBadge } from "@/components/domain/member/squad-badge";
import { StatusPill } from "@/components/domain/member/status-pill";
import { LastSeen } from "@/components/domain/member/last-seen";

const SQUAD_ORDER = { A: 0, B: 1 } as const;

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
    key: "squad",
    header: "Squad",
    cell: (m) => <SquadBadge squad={m.sandstormSquad} />,
    sortValue: (m) => (m.sandstormSquad ? SQUAD_ORDER[m.sandstormSquad] : 2),
  },
  {
    key: "status",
    header: "Status",
    cell: (m) => <StatusPill status={activityFromBucket(m.lastSeen)} />,
    sortValue: (m) => bucketSortValue(m.lastSeen),
  },
  {
    key: "lastSeen",
    header: "Last seen",
    cell: (m) => <LastSeen bucket={m.lastSeen} observedAt={m.lastSeenObservedAt} />,
    sortValue: (m) => bucketSortValue(m.lastSeen),
  },
  {
    key: "power",
    header: "Power",
    align: "right",
    cell: (m) => <Metric value={m.power} className="text-text" />,
    sortValue: (m) => m.power,
  },
  {
    key: "level",
    header: "Level",
    align: "right",
    cell: (m) => (
      <span className="font-mono tabular-nums text-text-2">{m.level}</span>
    ),
    sortValue: (m) => m.level,
  },
  {
    key: "donations",
    header: "Donations",
    align: "right",
    cell: (m) => <Metric value={m.donations} className="text-text-2" />,
    sortValue: (m) => m.donations,
  },
  {
    key: "kills",
    header: "Kills",
    align: "right",
    cell: (m) => <Metric value={m.kills} className="text-text-2" />,
    sortValue: (m) => m.kills,
  },
];

export function MembersTable({ members }: { members: Member[] }) {
  return (
    <DataTable
      columns={columns}
      rows={members}
      getRowId={(m) => m.id}
      initialSort={{ key: "power", dir: "desc" }}
    />
  );
}
