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
  getContributionsMap,
  getEvents,
  getMembers,
} from "@/lib/data/queries";
import { currentRole } from "@/lib/auth/guard";
import { EditableEvent } from "./event-edit-dialog";

export const metadata = { title: "Events" };
export const dynamic = "force-dynamic";

const MATRIX_EVENTS: MatrixEvent[] = [
  { id: "e-hunt", type: "guildHunt" },
  { id: "e-sandstorm", type: "sandstorm" },
  { id: "e-duel", type: "guildDuel" },
  { id: "e-pallantis", type: "pallantis" },
];

export default async function EventsPage() {
  const [events, contribMap, members, role] = await Promise.all([
    getEvents(),
    getContributionsMap(),
    getMembers(),
    currentRole(),
  ]);
  const canEdit = role === "admin" || role === "officer";
  const getValue = (eventId: string, memberId: string) =>
    contribMap[eventId]?.find((e) => e.memberId === memberId)?.value;

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
          {events.map((e) =>
            canEdit ? (
              <EditableEvent
                key={e.id}
                event={e}
                members={members}
                contributions={contribMap[e.id] ?? []}
              >
                <EventCard event={e} members={members} />
              </EditableEvent>
            ) : (
              <EventCard key={e.id} event={e} members={members} />
            ),
          )}
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
              entries={contribMap["e-hunt"] ?? []}
              members={members}
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
              entries={contribMap["e-sandstorm"] ?? []}
              members={members}
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
          members={members}
          events={MATRIX_EVENTS}
          getValue={getValue}
        />
      </section>
    </div>
  );
}
