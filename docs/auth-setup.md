# Auth + DB activation

The backend is written but **dormant** — the app runs on mock data until you do
these steps. Nothing here runs during `next build`, so the mock app stays
browsable in the meantime.

## 1. Neon database

1. Create a project at [neon.tech](https://neon.tech) and copy the **pooled**
   connection string.
2. Put it in `.env` as `DATABASE_URL` (copy `.env.example` → `.env` first).
3. Push the schema:
   ```bash
   npm run db:push        # or: db:generate then db:migrate for versioned migrations
   ```
   Inspect with `npm run db:studio`.

## 2. Discord application

1. [Discord Developer Portal](https://discord.com/developers/applications) →
   New Application.
2. OAuth2 → copy **Client ID** / **Client Secret** → `.env` as
   `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET`.
3. Add redirect URL: `https://<your-domain>/api/auth/callback/discord`
   (and `http://localhost:3000/api/auth/callback/discord` for local).
4. Scopes are requested by the app: `identify email guilds guilds.members.read`.

## 3. Gating & roles (`.env`)

- `VOID_GUILD_ID` — VOID's Discord server id (login is gated to its members).
- `ADMIN_DISCORD_IDS` — comma-separated user ids that are always Admin (failsafe).
- `DISCORD_ROLE_MAP` — JSON of Discord role id → app role, e.g.
  `{"<r4RoleId>":"officer","<adminRoleId>":"admin"}`.
- `AUTH_SECRET` — `npx auth secret`.

Precedence: `ADMIN_DISCORD_IDS` → `DISCORD_ROLE_MAP` → default `member`. A DB
pin (`users.rolePinned`) overrides the Discord result.

## 4. Turn on route gating

```bash
mv middleware.ts.example middleware.ts
```

This redirects unauthenticated requests to `/signin` for every route except the
auth API and the sign-in page. Deploy on Vercel with the same env vars set in
the project settings.

## Where things live

| Path | What |
| --- | --- |
| `src/auth.ts` | Auth.js v5 config — Discord provider, guild gating, role callbacks |
| `src/lib/auth/roles.ts` | `resolveAppRole` (env → role map) |
| `src/lib/auth/discord.ts` | guild-membership fetch (`guilds.members.read`) |
| `src/lib/db/schema.ts` | Drizzle schema (auth tables + domain + history) |
| `src/lib/db/index.ts` | Neon + Drizzle connection |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth.js route handlers |
| `src/app/signin/page.tsx` | sign-in page |
| `middleware.ts.example` | dormant route gating |
| `drizzle.config.ts` | drizzle-kit config |
