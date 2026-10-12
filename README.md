# VOID Guild Manager

A guild management web application for the **VOID** guild in [*Palmon: Survival*](https://palmonsurvival.com/).
Tracks members, events, and strongholds, with Discord-based sign-in and
append-only history so trends accrue from the first day the roster is recorded.

Built as a full-stack Next.js application: server components for the data-heavy
screens, a Postgres schema managed with Drizzle, and role-gated access for guild
officers and admins.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript 5 |
| Database | Postgres on [Neon](https://neon.tech) via `@neondatabase/serverless` |
| ORM / migrations | Drizzle ORM + drizzle-kit (`generate`, `migrate`, `push`, `studio`) |
| Auth | Auth.js (NextAuth v5) with Discord OAuth and the Drizzle adapter |
| UI | Tailwind CSS 4, Radix UI primitives, `cmdk`, `lucide-react`, `class-variance-authority` |

## Screens

The six main screens live under the `(app)` route group. Everything is gated by
middleware; `/signin` is the only publicly reachable page.

- **Dashboard** — guild state at a glance
- **Members** — roster with status (active, LOA, and other states defined in the schema)
- **Strongholds** — stronghold holdings and the buffs attached to them
- **Events** — event scheduling and participation
- **Trends** — history views built from the append-only tables
- **Admin** — signed-in users and app-role assignment (pin / reset)
- **Library** (`/library`, not in the nav) — gallery of the shared UI components
  on mock data, with a preview page per component

## Design notes

**Access control is enforced in middleware, not per page.** Every request that
isn't authenticated is redirected to `/signin`, with the auth API, Next
internals, and `robots.txt` exempted. One consequence is documented in the
middleware itself: because logged-out requests all land on `/signin` — including
Discord's link-unfurl crawler — that page's Open Graph tags are the unfurl
everyone sees, so its OG image is kept outside the gate.

**History tables are append-only by design.** The schema carries timestamped
history tables (participation, donations, kills, rank changes, strongholds,
Guild Clash, audit log) so Trends can read real history instead of
reconstructing it. The write paths aren't wired yet: the in-app editors update
current-state rows in place, and Trends currently reads a seeded weekly
snapshot.

**Roles come from three sources** — an admin allowlist (built-in ids plus
environment configuration), pinned assignments made on the Admin page, and
Discord roles, in that order of precedence — tracked in a `role_source` enum so
it is always clear why a given user has the permissions they do. Roles resolve
at sign-in, so a change takes effect at the person's next login.

## Documentation

- [`PLAN.md`](PLAN.md) — the living reference spec: data model, screens, and terminology
- [`docs/game-data.md`](docs/game-data.md) — game mechanics extracted from in-game
  screenshots. **Authoritative** where it and the plan disagree; the facts are now
  maintained with provenance in the separate `palmon-data` library
- [`docs/components.md`](docs/components.md) — the component vocabulary every screen is built from
- [`docs/auth-setup.md`](docs/auth-setup.md) — Discord OAuth, env vars, role resolution, and database setup
- [`mockups/void-mockup.html`](mockups/void-mockup.html) — the clickable design mockup the build followed

## Running it locally

Requires Node and a Postgres connection string (Neon or any Postgres).

```sh
npm install
cp .env.example .env          # AUTH_SECRET, Discord OAuth credentials, DATABASE_URL
npm run db:push               # create the schema (no migration files are committed)
npm run db:seed               # optional, destructive: wipes and reloads seed data
npm run dev
```

Other database commands: `npm run db:generate` / `npm run db:migrate` to start
versioned migrations, and `npm run db:studio` to browse the data. Every page except
`/signin` needs a working Discord login, so local runs need real OAuth credentials
and `VOID_GUILD_ID`.

## Status

Live in production on Vercel against Neon, with the real VOID roster. Officers
and admins edit members, events, strongholds and app roles in-app. Not built yet:
member self-edit, history write paths, and JSON export — `PLAN.md` flags each
inline.

---

Unofficial and not affiliated with the developers of *Palmon: Survival*.
