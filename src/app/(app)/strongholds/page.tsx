import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { StatTile } from "@/components/domain/data/stat-tile";
import { Metric } from "@/components/domain/data/metric";
import { BuffStack } from "@/components/domain/stronghold/buff-stack";
import { StrongholdCard } from "@/components/domain/stronghold/stronghold-card";
import {
  BUFF_LABEL,
  computeBuffTotals,
  totalExpPerHour,
} from "@/lib/game/stronghold";
import { MOCK_STRONGHOLDS } from "@/lib/mock/strongholds";
import { MOCK_MEMBERS } from "@/lib/mock/members";

export const metadata = { title: "Strongholds — VOID" };

export default function StrongholdsPage() {
  const all = MOCK_STRONGHOLDS;
  const sanctums = all.filter((s) => s.category === "sanctum");
  const ruins = all.filter((s) => s.category === "desertRuin");

  const totalExp = totalExpPerHour(all);
  const sanctumExp = totalExpPerHour(sanctums);
  const ruinExp = totalExpPerHour(ruins);

  const totals = computeBuffTotals(all);
  const gaps = Object.entries(totals)
    .filter(([, v]) => v === 0)
    .map(([t]) => BUFF_LABEL[t as keyof typeof BUFF_LABEL]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Guild Strongholds"
        title="Strongholds"
        sub={`${sanctums.length} sanctums · ${ruins.length} desert ruins`}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Total EXP"
          value={<Metric value={totalExp} format="full" />}
          unit="/h"
          accent="desert"
        />
        <StatTile
          label="Sanctum EXP"
          value={<Metric value={sanctumExp} format="full" />}
          unit="/h"
          accent="desert"
          foot={`${sanctums.length} of 6`}
        />
        <StatTile
          label="Ruin EXP"
          value={<Metric value={ruinExp} format="full" />}
          unit="/h"
          accent="desert"
          foot={`${ruins.length} of 6`}
        />
        <StatTile
          label="Buff gaps"
          value={<Metric value={gaps.length} format="full" />}
          accent={gaps.length > 0 ? "bad" : "good"}
          foot={gaps.length > 0 ? gaps.join(", ") : "full coverage"}
        />
      </div>

      <section className="space-y-2">
        <SectionTitle>Active buff stack</SectionTitle>
        <BuffStack strongholds={all} />
      </section>

      <section className="space-y-3">
        <SectionTitle>Sanctums</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sanctums.map((s) => (
            <StrongholdCard
              key={s.id}
              stronghold={s}
              members={MOCK_MEMBERS}
              canEdit
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle>Desert Ruins</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ruins.map((s) => (
            <StrongholdCard
              key={s.id}
              stronghold={s}
              members={MOCK_MEMBERS}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
