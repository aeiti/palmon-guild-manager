import type { ActivityTier, LastSeenBucket } from "./types";

/**
 * Last-seen bucket rules (docs/components.md §5.1, PLAN §5a). The game gives a
 * bucket; we render it verbatim and derive the activity tier from it. We never
 * turn a bucket back into a timestamp.
 */

/** The exact text the game shows, e.g. "Online", "12 min", "3h", "over 7d". */
export function formatBucket(bucket: LastSeenBucket): string {
  switch (bucket.kind) {
    case "online":
      return "Online";
    case "minutes":
      return `${bucket.n} min`;
    case "hours":
      return `${bucket.n}h`;
    case "days":
      return `${bucket.n}d`;
    case "over":
      return `over ${bucket.days}d`;
  }
}

/** Ordering for sorting a Last Seen column — 0 (Online) … 7 (over 30d). */
export function bucketSortValue(bucket: LastSeenBucket): number {
  switch (bucket.kind) {
    case "online":
      return 0;
    case "minutes":
      return 1;
    case "hours":
      return 2;
    case "days":
      return bucket.n === 1 ? 3 : 4;
    case "over":
      return bucket.days === 3 ? 5 : bucket.days === 7 ? 6 : 7;
  }
}

/**
 * Activity tier for the pruning watchlist:
 *   Active  — Online … 2d
 *   Idle    — over 3d, over 7d
 *   Inactive — over 30d
 */
export function activityFromBucket(bucket: LastSeenBucket): ActivityTier {
  switch (bucket.kind) {
    case "online":
    case "minutes":
    case "hours":
    case "days":
      return "active";
    case "over":
      return bucket.days === 30 ? "inactive" : "idle";
  }
}
