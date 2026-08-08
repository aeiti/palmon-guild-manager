import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Info, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type Severity = "critical" | "warning" | "info";

const SEV: Record<
  Severity,
  { stripe: string; icon: React.ComponentType<{ className?: string }>; text: string }
> = {
  critical: { stripe: "border-l-bad", icon: OctagonAlert, text: "text-bad" },
  warning: { stripe: "border-l-warn", icon: AlertTriangle, text: "text-warn" },
  info: { stripe: "border-l-violet", icon: Info, text: "text-violet" },
};

/**
 * A single "Needs Attention" row (docs/components.md §3.5): a severity stripe +
 * icon, title, detail, and an optional link to the thing that needs action.
 */
export function WarningItem({
  severity,
  title,
  detail,
  href,
  className,
}: {
  severity: Severity;
  title: React.ReactNode;
  detail?: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const { stripe, icon: Icon, text } = SEV[severity];
  const inner = (
    <div
      className={cn(
        "flex items-start gap-3 border-l-2 bg-surface px-3 py-2",
        stripe,
        href && "transition-colors hover:bg-surface-2",
        className,
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", text)} />
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm text-text">{title}</p>
        {detail ? <p className="text-xs text-text-3">{detail}</p> : null}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
