# Auth + DB setup

Auth and the database are **live in production**: route gating is on
(`middleware.ts`), login is Discord-only and gated to VOID's server, and every
screen reads from Neon. Production secrets live in the **Vercel project env**;
there is no `.env` in the repo, so a local run of any gated page needs these
values supplied yourself.

## 1. Neon database

1. Create a project at [neon.tech](https://neon.tech) and copy the **pooled**
   connection string.
2. Put it in `.env` as `DATABASE_URL` (copy `.env.example` → `.env` first).
3. Push the schema:
   ```bash
   npm run db:push
   ```
   No migration files are committed (`drizzle/` doesn't exist yet), so
   `db:push` is the working path. `db:generate` + `db:migrate` would start a
   versioned history from scratch.
4. Optional: `npm run db:seed` loads the real VOID roster. It **deletes** the
   existing members, events, strongholds, participation **and `user` rows**
   first (losing role pins and account links) — never point it at production.
5. Inspect with `npm run db:studio`.

## 2. Discord application

1. [Discord Developer Portal](https://discord.com/developers/applications) →
   New Application.
2. OAuth2 → copy **Client ID** / **Client Secret** → `.env` as
   `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET`.
3. Add redirect URL: `https://<your-domain>/api/auth/callback/discord`
   (and `http://localhost:3000/api/auth/callback/discord` for local).
4. Scopes are requested by the app: `identify email guilds guilds.members.read`.

## 3. Gating, roles & site (`.env`)

- `VOID_GUILD_ID` — VOID's Discord server id (login is gated to its members).
- `ADMIN_DISCORD_IDS` — comma-separated user ids that are always Admin. Merged
  with two **built-in** admin ids hard-coded in `src/lib/auth/roles.ts`
  (Kitsune, Lprdgdss), so the guild leads keep Admin even if the env var is
  unset.
- `DISCORD_ROLE_MAP` — JSON of Discord role id → app role, e.g.
  `{"<r4RoleId>":"officer","<adminRoleId>":"admin"}`.
- `AUTH_SECRET` — `npx auth secret`.
- `NEXT_PUBLIC_SITE_URL` — deployed origin, used as `metadataBase` so the
  `/signin` Open Graph image resolves to an absolute URL in Discord unfurls.

### How roles resolve

Precedence (`resolveAppRole`): **admin allowlist** (built-ins + env) → **DB
pin** (`users.rolePinned`, set on `/admin`) → **Discord role map** → default
`member`. The resolved role and its source are written back to the `user` row.

- Roles resolve **only at sign-in** (JWT sessions). A role change on `/admin`
  takes effect when that person signs out and back in.
- Discord ID links accounts to the roster: login stores `users.discordId` and
  links the `member` row with the same Discord ID. Officers can set a member's
  Discord ID in the member editor to pre-link someone who hasn't signed in.
- The `/admin` Users table lists only people who have signed in at least once.
- Officers can assign member/officer; only Admins can grant, change or remove
  Admin. Allowlisted admins are locked.
- A DB failure during login falls back to a pure role compute, so sign-in never
  breaks.

## 4. Route gating

`middleware.ts` redirects unauthenticated requests to `/signin` for every route
except `api/auth`, Next internals, `favicon.ico`, `robots.txt`, and `/signin/*`
(which also serves the OG image). Any new publicly fetchable route — a sitemap,
another OG image, `.well-known/*` — needs adding to the matcher exclusion, or it
redirects to `/signin`.

## Where things live

| Path | What |
| --- | --- |
| `src/auth.ts` | Auth.js v5 config — Discord provider, guild gating, role callbacks |
| `src/lib/auth/roles.ts` | `resolveAppRole` + built-in admin allowlist |
| `src/lib/auth/identity.ts` | sign-in: persist Discord ID, link member, resolve + store role |
| `src/lib/auth/guard.ts` | `requireOfficer` / `requireAdmin` for server actions |
| `src/lib/auth/discord.ts` | guild-membership fetch (`guilds.members.read`) |
| `src/lib/actions/` | server actions — member, event, stronghold edits; role assignment |
| `src/lib/db/schema.ts` | Drizzle schema (auth tables + domain + history) |
| `src/lib/db/index.ts` | Neon + Drizzle connection |
| `src/lib/db/seed.ts` | seed script (destructive) |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth.js route handlers |
| `src/app/signin/page.tsx` | sign-in page |
| `middleware.ts` | route gating |
| `drizzle.config.ts` | drizzle-kit config |
