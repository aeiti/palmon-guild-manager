import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/lib/db/schema";
import { fetchGuildMember, voidGuildId } from "@/lib/auth/discord";
import { resolveAppRole, type AppRole, type RoleSource } from "@/lib/auth/roles";
import { resolveIdentity } from "@/lib/auth/identity";

/**
 * Auth.js v5 (PLAN §3). Login is Discord OAuth, gated to membership in VOID's
 * server; the app role is derived from Discord roles (env allowlist → role map).
 * Client id/secret are read from AUTH_DISCORD_ID / AUTH_DISCORD_SECRET env vars.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers: [
    Discord({
      authorization: {
        params: { scope: "identify email guilds guilds.members.read" },
      },
    }),
  ],
  callbacks: {
    // Gate: must be a member of VOID's Discord server.
    async signIn({ account }) {
      if (account?.provider !== "discord" || !account.access_token) return false;
      const member = await fetchGuildMember(account.access_token, voidGuildId());
      return member !== null;
    },
    // Resolve app role at login (re-read on each sign-in). Also persists the
    // Discord id + links the roster member, and honours an Admin-page pin.
    async jwt({ token, account, profile, user }) {
      if (account?.access_token) {
        const member = await fetchGuildMember(
          account.access_token,
          voidGuildId(),
        );
        const discordId = String(
          (profile as { id?: string } | undefined)?.id ?? token.sub ?? "",
        );
        const userId =
          (user as { id?: string } | undefined)?.id ?? token.sub ?? "";
        const roleIds = member?.roles ?? [];

        let role: AppRole = "member";
        let source: RoleSource = "discord";
        try {
          ({ role, source } = await resolveIdentity(userId, discordId, roleIds));
        } catch (e) {
          // Never block login on a persistence hiccup — fall back to a pure
          // compute (env allowlist → Discord map → member).
          ({ role, source } = resolveAppRole(discordId, roleIds));
          console.error("resolveIdentity failed; using computed role", e);
        }

        token.discordId = discordId;
        token.appRole = role;
        token.roleSource = source;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.discordId = token.discordId as string | undefined;
        session.user.appRole = token.appRole as AppRole | undefined;
        session.user.roleSource = token.roleSource as string | undefined;
      }
      return session;
    },
  },
});
