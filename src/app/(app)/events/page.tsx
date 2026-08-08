import { PageHeader, SectionTitle } from "@/components/layout/page-header";
import { Card, CardBody, CardHead, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/domain/event/event-card";
import { ContributionBoard } from "@/components/domain/event/contribution-board";
import {
  ParticipationMatrix,
  type MatrixEvent,
} from "@/components/domain/event/participation-matrix";
import {
  MOCK_CONTRIBUTIONS,
  MOCK_EVENTS,
  getContribution,
} from "@/lib/mock/events";
import { MOCK_MEMBERS } from "@/lib/mock/members";

export const metadata = { title: "Events — VOID" };

const MATRIX_EVENTS: MatrixEvent[] = [
  { id: "e-hunt", type: "guildHunt" },
  { id: "e-sandstorm", type: "sandstorm" },
  { id: "e-duel", type: "guildDuel" },
  { id: "e-pallantis", type: "pallantis" },
];

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Schedule"
        title="Events"
        sub="Six guild events · times shown in server (UTC−2) and your local time"
      />

      <section className="space-y-3">
        <SectionTitle>This week</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {MOCK_EVENTS.map((e) => (
            <EventCard key={e.id} event={e} members={MOCK_MEMBERS} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead>
            <CardTitle>Guild Hunt — top damage</CardTitle>
            <Badge tone="neutral">MVP ×10</Badge>
          </CardHead>
          <CardBody>
            <ContributionBoard
              entries={MOCK_CONTRIBUTIONS["e-hunt"]}
              members={MOCK_MEMBERS}
              metric="damage"
            />
          </CardBody>
        </Card>
        <Card>
          <CardHead>
            <CardTitle>Sandstorm — Squad A points</CardTitle>
          </CardHead>
          <CardBody>
            <ContributionBoard
              entries={MOCK_CONTRIBUTIONS["e-sandstorm"]}
              members={MOCK_MEMBERS}
              metric="personalPoints"
            />
          </CardBody>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionTitle>Participation matrix</SectionTitle>
        <p className="text-sm text-text-3">
          Contributed values per member per event — a muted dash means they
          didn&apos;t show up.
        </p>
        <ParticipationMatrix
          members={MOCK_MEMBERS}
          events={MATRIX_EVENTS}
          getValue={getContribution}
        />
      </section>
    </div>
  );
}
