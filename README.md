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

Routes live under the `(app)` group and are gated by middleware; `/signin` is the
only publicly reachable page.

- **Dashboard** — guild state at a glance
- **Members** — roster with status (active, LOA, and other states defined in the schema)
- **Strongholds** — stronghold holdings and the buffs attached to them
- **Events** — event scheduling and participation
- **Trends** — history views built from the append-only tables
- **Admin** — role and roster administration
- **Library** — reference pages for game data, including per-entry detail routes

## Design notes

**Access control is enforced in middleware, not per page.** Every request that
isn't authenticated is redirected to `/signin`, with the auth API, Next
internals, and `robots.txt` exempted. One consequence is documented in the
middleware itself: because logged-out requests all land on `/signin` — including
Discord's link-unfurl crawler — that page's Open Graph tags are the unfurl
everyone sees, so its OG image is kept outside the gate.

**History tables are append-only.** Roster and stronghold snapshots are written
rather than updated in place, so the Trends screen has real history to read back
instead of reconstructing it.

**Roles come from three sources** — Discord, environment configuration, and
pinned assignments — tracked explicitly in a `role_source` enum so it is always
clear why a given user has the permissions they do.

## Documentation

- [`PLAN.md`](PLAN.md) — the living reference spec: data model, screens, and terminology
- [`docs/game-data.md`](docs/game-data.md) — game mechanics extracted from in-game
  screenshots. **Authoritative** where it and the plan disagree
- [`docs/components.md`](docs/components.md) — the component vocabulary every screen is built from
- [`docs/auth-setup.md`](docs/auth-setup.md) — Discord OAuth and database configuration
- [`mockups/void-mockup.html`](mockups/void-mockup.html) — the clickable design mockup the build followed

## Running it locally

Requires Node and a Postgres connection string (Neon or any Postgres).

```sh
npm install
cp .env.example .env          # AUTH_SECRET, Discord OAuth credentials, DATABASE_URL
npm run db:migrate            # apply migrations
npm run db:seed               # optional: load seed data
npm run dev
```

Other database commands: `npm run db:generate` to create a migration from schema
changes, `npm run db:push` to push without a migration file, and `npm run db:studio`
to browse the data.

## Status

Built and running against a live schema. `PLAN.md` still carries a "pre-build"
status line from early in the project — the screens, schema, auth, and middleware
described above are implemented.

---

Unofficial and not affiliated with the developers of *Palmon: Survival*.
