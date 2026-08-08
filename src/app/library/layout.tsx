import Link from "next/link";

/**
 * Component gallery shell. Internal QA surface — intentionally NOT wrapped in
 * AppShell and NOT linked from the member-facing nav.
 */
export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex-1">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link
          href="/library"
          className="font-mono text-sm uppercase tracking-[0.18em] text-text"
        >
          VOID · Library
        </Link>
        <span className="font-mono text-xs uppercase tracking-wide text-text-3">
          Component gallery
        </span>
      </header>
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
