# VOID Guild Manager

A guild management web application for the **VOID** guild in [*Palmon: Survival*](https://palmonsurvival.com/).
It tracks members, events, and strongholds, with Discord-based sign-in and
append-only history so trends accrue from the first day the roster is recorded.

Live in production on Vercel and Neon, in use by the guild. Built as a
full-stack Next.js application: server components for the data-heavy screens, a
Postgres schema managed with Drizzle, role-gated access for guild officers and
admins, and in-app editing of the roster.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript 5 |
| Database | Postgres on [Neon](https://neon.tech) via `@neondatabase/serverless` |
| ORM and migrations | Drizzle ORM with drizzle-kit (`generate`, `migrate`, `push`, `studio`) |
| Auth | Auth.js (NextAuth v5) with Discord OAuth and the Drizzle adapter |
| UI | Tailwind CSS 4, Radix UI primitives, `cmdk`, `lucide-react`, `class-variance-authority` |

## Screens

The six main screens live under the `(app)` route group. Everything is gated by
middleware, and `/signin` is the only publicly reachable page.

- **Dashboard**: guild state at a glance
- **Members**: roster with status (active, LOA, and the other states defined in the schema)
- **Strongholds**: stronghold holdings and the buffs attached to them
- **Events**: event scheduling and participation
- **Trends**: history views built from the append-only tables
- **Admin**: signed-in users and app-role assignment (pin or reset)
- **Library** (`/library`, not in the nav): gallery of the shared UI components on
  mock data, with a preview page per component

## Design notes

**Access control is enforced in middleware, not per page.** Every unauthenticated
request is redirected to `/signin`, with the auth API, Next internals, and
`robots.txt` exempted. One consequence is documented in the middleware itself:
because logged-out requests all land on `/signin`, including Discord's
link-unfurl crawler, that page's Open Graph tags are the unfurl everyone sees, so
its OG image is kept outside the gate.

**History tables are append-only by design.** The schema carries timestamped
history tables (participation, donations, kills, rank changes, strongholds, Guild
Clash, audit log) so Trends can read real history instead of reconstructing it
from current state. The write paths aren't wired yet: the in-app editors update
current-state rows in place, and Trends currently reads a seeded weekly snapshot.

**Roles come from three sources,** in order of precedence: an admin allowlist
(built-in IDs plus environment configuration), assignments pinned on the Admin
page, and Discord roles. The winner is tracked in a `role_source` enum so it is
always clear why a given user has the permissions they do. Roles resolve at
sign-in, so a change takes effect at the person's next login.

## Documentation

- [`PLAN.md`](PLAN.md): the living reference spec covering the data model, screens, and terminology
- [`docs/game-data.md`](docs/game-data.md): game mechanics extracted from in-game
  screenshots. **Authoritative** where it and the plan disagree; the facts are now
  maintained with provenance in the separate `palmon-data` library
- [`docs/components.md`](docs/components.md): the component vocabulary every screen is built from
- [`docs/auth-setup.md`](docs/auth-setup.md): Discord OAuth, env vars, role resolution, and database setup
- [`mockups/void-mockup.html`](mockups/void-mockup.html): the clickable design mockup the build followed

## Running it locally

Requires Node and a Postgres connection string, from Neon or anywhere else.

```sh
npm install
cp .env.example .env          # AUTH_SECRET, Discord OAuth credentials, DATABASE_URL
npm run db:push               # create the schema (no migration files are committed)
npm run db:seed               # optional and destructive: wipes and reloads seed data
npm run dev
```

Other commands: `npm test` runs the unit tests, `npm run lint` runs ESLint,
`npm run db:generate` and `npm run db:migrate` start versioned migrations, and
`npm run db:studio` opens a browser for the data. Every page except `/signin`
needs a working Discord login, so local runs need real OAuth credentials and
`VOID_GUILD_ID`.

## Status

Live in production: Vercel and Neon, Discord login, in-app editing. [`PLAN.md`](PLAN.md)
is the living reference spec, and flags inline where the build deliberately differs
from it or hasn't caught up yet.

---

Unofficial, and not affiliated with the developers of *Palmon: Survival*.
