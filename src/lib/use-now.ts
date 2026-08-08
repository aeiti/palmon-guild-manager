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

/**
 * False during SSR and the first client render, true thereafter — without a
 * setState-in-effect. Use to gate viewer-local time rendering so it can't cause
 * a hydration mismatch (the server has no idea what timezone the viewer is in).
 */
export function useMounted(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
