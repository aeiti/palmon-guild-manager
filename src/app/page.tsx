/**
 * Temporary landing — a design-system smoke test until AppShell + Dashboard
 * land. Confirms the dark tokens, mono wordmark, and colour rules render.
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-text-3">
          Palmon: Survival · Server #111
        </p>
        <h1 className="font-mono text-3xl uppercase tracking-[0.18em] text-text">
          VOID
        </h1>
        <p className="max-w-md text-base text-text-2">
          Guild manager — members, events, strongholds, and trends. The UI is
          being built from the component spec; screens land next.
        </p>
      </div>

      {/* Colour-rule swatches — violet = interactive, desert = economy, RYG = state. */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-md border border-border-2 bg-surface px-3 py-1.5 font-mono text-xs text-violet">
          violet · interactive
        </span>
        <span className="rounded-md border border-border-2 bg-surface px-3 py-1.5 font-mono text-xs text-desert">
          desert · EXP &amp; buffs
        </span>
        <span className="rounded-md border border-border-2 bg-surface px-3 py-1.5 font-mono text-xs text-good">
          good
        </span>
        <span className="rounded-md border border-border-2 bg-surface px-3 py-1.5 font-mono text-xs text-warn">
          warn
        </span>
        <span className="rounded-md border border-border-2 bg-surface px-3 py-1.5 font-mono text-xs text-bad">
          bad
        </span>
      </div>
    </main>
  );
}
