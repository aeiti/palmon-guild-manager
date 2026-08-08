const DISCORD_API = "https://discord.com/api/v10";

export function voidGuildId(): string {
  return process.env.VOID_GUILD_ID ?? "";
}

export interface GuildMember {
  roles: string[];
  nick?: string | null;
  user?: { id: string; username: string };
}

/**
 * Fetch the caller's membership (incl. role ids) in a guild. Needs the
 * `guilds.members.read` scope. Returns null if they aren't a member — that's
 * the signal used to gate login to VOID's Discord server (PLAN §3).
 */
export async function fetchGuildMember(
  accessToken: string,
  guildId: string,
): Promise<GuildMember | null> {
  if (!guildId) return null;
  const res = await fetch(
    `${DISCORD_API}/users/@me/guilds/${guildId}/member`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) return null;
  return (await res.json()) as GuildMember;
}
