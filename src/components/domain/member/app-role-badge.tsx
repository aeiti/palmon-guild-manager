import { ShieldCheck, Shield, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppRole = "admin" | "officer" | "member";
export type RoleSource = "discord" | "env" | "pinned";

/**
 * App permission role (docs/components.md §3.1) — icon + word, deliberately a
 * different shape from RankBadge's bare "R4" (§5.4). App role and in-game rank
 * are independent axes. Uses neutral chrome tones, not the reserved semantic
 * colours; Admin is emphasised by weight, not by poaching violet.
 */
const ROLE: Record<AppRole, { label: string; icon: LucideIcon; cls: string }> =
  {
    admin: {
      label: "Admin",
      icon: ShieldCheck,
      cls: "border-text-3/70 bg-surface-2 text-text font-semibold",
    },
    officer: {
      label: "Officer",
      icon: Shield,
      cls: "border-border-2 bg-surface-2 text-text-2",
    },
    member: {
      label: "Member",
      icon: User,
      cls: "border-border bg-surface text-text-3",
    },
  };

const SOURCE_LABEL: Record<RoleSource, string> = {
  discord: "Discord role",
  env: "ENV allowlist",
  pinned: "Pinned",
};

export function AppRoleBadge({
  role,
  source,
  className,
}: {
  role: AppRole;
  source?: RoleSource;
  className?: string;
}) {
  const { label, icon: Icon, cls } = ROLE[role];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs",
        cls,
        className,
      )}
      title={source ? `${label} · ${SOURCE_LABEL[source]}` : label}
    >
      <Icon className="size-3" />
      <span className="font-mono uppercase tracking-wide">{label}</span>
      {source ? (
        <span className="text-[0.6rem] font-normal normal-case text-text-3">
          {SOURCE_LABEL[source]}
        </span>
      ) : null}
    </span>
  );
}
