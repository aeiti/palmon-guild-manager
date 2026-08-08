import * as React from "react";

/**
 * A once-a-second clock as an external store (no setState-in-effect). The
 * server snapshot is null so there is no hydration mismatch; the second-bucket
 * snapshot keeps React from re-rendering in a loop. Returns null until mounted.
 */
export function useNow(): Date | null {
  const subscribe = React.useCallback((onChange: () => void) => {
    const id = setInterval(onChange, 1000);
    return () => clearInterval(id);
  }, []);
  const seconds = React.useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 1000),
    () => null,
  );
  return seconds === null ? null : new Date(seconds * 1000);
}
