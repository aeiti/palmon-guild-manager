import {
  Crosshair,
  Landmark,
  Snowflake,
  Swords,
  Tornado,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventType } from "@/lib/game/event";

/**
 * One icon per event type, defined once (docs/components.md §3.4). Lucide
 * stand-ins for now (neutral tone — the colour rules stay intact); a custom
 * hand-drawn set can replace these in a polish pass.
 */
const ICON: Record<EventType, LucideIcon> = {
  guildHunt: Crosshair,
  sandstorm: Tornado,
  guildDuel: Swords,
  guildClash: Trophy,
  pallantis: Landmark,
  arcticShowdown: Snowflake,
};

export function EventTypeIcon({
  type,
  className,
}: {
  type: EventType;
  className?: string;
}) {
  const Icon = ICON[type];
  return <Icon className={cn("size-4", className)} />;
}
