"use client";

import * as React from "react";
import type { Member } from "@/lib/game/types";
import type { AppUser } from "@/lib/mock/users";
import {
  AppRoleBadge,
  type AppRole,
} from "@/components/domain/member/app-role-badge";
import { RankBadge } from "@/components/domain/member/rank-badge";
import { MemberChip } from "@/components/domain/member/member-chip";

const ROLES: AppRole[] = ["member", "officer", "admin"];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/**
 * User + app-role management (PLAN §3). Changing the Assign select creates a
 * manual pin (source → Pinned); Reset reverts to the Discord-mapped role.
 * ENV-allowlisted users are locked (they can't be demoted — failsafe). Edits
 * are local until auth + DB land.
 */
export function AdminUsersTable({
  users,
  members,
}: {
  users: AppUser[];
  members: Member[];
}) {
  const byId = new Map(members.map((m) => [m.id, m]));
  const [overrides, setOverrides] = React.useState<Record<string, AppRole>>({});

  const setRole = (id: string, role: AppRole) =>
    setOverrides((o) => ({ ...o, [id]: role }));
  const reset = (id: string) =>
    setOverrides((o) => {
      const next = { ...o };
      delete next[id];
      return next;
    });

  return (
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
            const overridden = u.id in overrides;
            const role = overrides[u.id] ?? u.role;
            const source = overridden ? "pinned" : u.source;
            const envLocked = u.source === "env";
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
                  <AppRoleBadge role={role} source={source} />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={role}
                    disabled={envLocked}
                    onChange={(e) => setRole(u.id, e.target.value as AppRole)}
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
                  ) : overridden ? (
                    <button
                      type="button"
                      onClick={() => reset(u.id)}
                      className="text-xs text-violet hover:underline"
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
  );
}
