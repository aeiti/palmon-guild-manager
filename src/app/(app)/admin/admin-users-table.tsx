"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Member } from "@/lib/game/types";
import type { AppUser } from "@/lib/mock/users";
import { setUserRole } from "@/lib/actions/admin";
import {
  AppRoleBadge,
  type AppRole,
} from "@/components/domain/member/app-role-badge";
import { RankBadge } from "@/components/domain/member/rank-badge";
import { MemberChip } from "@/components/domain/member/member-chip";

const ROLES: AppRole[] = ["member", "officer", "admin"];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/**
 * User + app-role management (PLAN §3). Changing the Assign select pins the
 * role (source → Pinned) and persists it; Reset un-pins. ENV-allowlisted users
 * are locked (failsafe). Admin only — the server action re-checks.
 */
export function AdminUsersTable({
  users,
  members,
}: {
  users: AppUser[];
  members: Member[];
}) {
  const router = useRouter();
  const byId = new Map(members.map((m) => [m.id, m]));
  const [pending, setPending] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function change(userId: string, role: AppRole, pinned: boolean) {
    setPending(userId);
    setError(null);
    try {
      await setUserRole(userId, role, pinned);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-2">
      {error ? <p className="text-xs text-bad">{error}</p> : null}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-surface-2">
            <tr>
              {["Member", "In-game", "App role", "Assign", ""].map((h, i) => (
                <th
                  key={h || i}
                  className="border-b border-border px-3 py-2 text-left font-mono text-xs uppercase tracking-wide text-text-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const m = byId.get(u.memberId);
              if (!m) return null;
              const envLocked = u.source === "env";
              const busy = pending === u.id;
              return (
                <tr
                  key={u.id}
                  className="border-b border-border/60 last:border-0 hover:bg-surface-2/40"
                >
                  <td className="px-3 py-2">
                    <MemberChip member={m} size="sm" />
                  </td>
                  <td className="px-3 py-2">
                    <RankBadge
                      rank={m.guildRank}
                      guildmaster={m.isGuildmaster}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <AppRoleBadge role={u.role} source={u.source} />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={u.role}
                      disabled={envLocked || busy}
                      onChange={(e) =>
                        change(u.id, e.target.value as AppRole, true)
                      }
                      aria-label={`App role for ${m.ign}`}
                      className="rounded-md border border-border-2 bg-surface px-2 py-1 text-xs text-text outline-none focus-visible:border-violet/60 disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {cap(r)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {envLocked ? (
                      <span
                        title="ENV allowlist — cannot be overridden"
                        className="font-mono text-[0.6rem] uppercase text-text-3"
                      >
                        Locked
                      </span>
                    ) : u.source === "pinned" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => change(u.id, u.role, false)}
                        className="text-xs text-violet hover:underline disabled:opacity-50"
                      >
                        Reset
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
