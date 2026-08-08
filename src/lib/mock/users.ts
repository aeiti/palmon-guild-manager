import type { AppRole, RoleSource } from "@/components/domain/member/app-role-badge";

/**
 * App-level users (the `users` table in PLAN §5), linked to roster members by
 * id. App role is separate from in-game rank — aeiti is R4 in-game but Admin in
 * the app (source: ENV allowlist), while Kitsune is R5 guildmaster but Officer.
 */
export interface AppUser {
  id: string;
  memberId: string;
  role: AppRole;
  source: RoleSource;
}

export const MOCK_USERS: AppUser[] = [
  { id: "u-aeiti", memberId: "m-aeiti", role: "admin", source: "env" },
  { id: "u-kitsune", memberId: "m-kitsune", role: "officer", source: "discord" },
  { id: "u-brann", memberId: "m-brann", role: "officer", source: "discord" },
  { id: "u-suvi", memberId: "m-suvi", role: "officer", source: "discord" },
  { id: "u-mira", memberId: "m-mira", role: "officer", source: "pinned" },
  { id: "u-rho", memberId: "m-rho", role: "member", source: "discord" },
  { id: "u-tovi", memberId: "m-tovi", role: "member", source: "discord" },
  { id: "u-desh", memberId: "m-desh", role: "member", source: "discord" },
  { id: "u-yara", memberId: "m-yara", role: "member", source: "discord" },
  { id: "u-pell", memberId: "m-pell", role: "member", source: "discord" },
  { id: "u-ozan", memberId: "m-ozan", role: "member", source: "discord" },
  { id: "u-lio", memberId: "m-lio", role: "member", source: "discord" },
];

export interface RoleMapEntry {
  label: string;
  discordRoleId: string;
  appRole: AppRole;
}

/** Discord role → app role map (PLAN §3). Precedence: ENV allowlist → this map
 * → optional manual pin. */
export const MOCK_ROLE_MAP: RoleMapEntry[] = [
  { label: "Site Admin", discordRoleId: "9d21f0a4c7b1", appRole: "admin" },
  { label: "Guild Master (R5)", discordRoleId: "5c8a2be91d40", appRole: "officer" },
  { label: "Officer (R4)", discordRoleId: "77b3e0f2ac19", appRole: "officer" },
  { label: "@everyone", discordRoleId: "00000000member", appRole: "member" },
];
