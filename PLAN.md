# VOID Guild Manager — Plan

A guild management website for the **Palmon: Survival** guild **VOID**. Tracks
members, events, and strongholds, with Discord-based login and trend history.

> Status: **planning + UI mockup review, pre-build.** This document is the
> living reference spec. Build begins on explicit go-ahead.
>
> UI mockup: [`mockups/void-mockup.html`](mockups/void-mockup.html) — open in a
> browser to click through Dashboard / Members / Strongholds / Events / Trends /
> Admin (sample data, design direction locked to a dark "survival HUD").
>
> Game mechanics: [`docs/game-data.md`](docs/game-data.md) — extracted from
> in-game screenshots. **That document is authoritative** where it and this
> plan disagree.
>
> UI vocabulary: [`docs/components.md`](docs/components.md) — the component
> spec every screen is built from.

### Terminology (corrected against the game)

| Earlier assumption | Actual |
| --- | --- |
| "Shrines = Ruins" | **Sanctum** and **Desert Ruins** are separate categories. "Shrine" is part of *sanctum names* (Goldglade Shrine). |
| Ruins provide nothing | Ruins provide **no buffs** but **do** produce desert EXP/h. |
| Sanctum = Guardian + 2 Governors | Guardian ×1 + **Governors (capacity scales with level)** + **Sentries 0–5**. |
| Sandstorm "slots A/B" | **Skirmish Squad A / B** — separate roster *and* schedule. |
| GVG | **Guild Duel**, with a **Guild Clash** season leaderboard. |
| Temple | **Clash of Pallantis**, scored in **Temple Points**. |

---

## 1. Goals

- Track **members**: in-game rank (R1–R5), usual online times, Skirmish Squad
  preference, power/level, status, notes.
- Manage **events**: Guild Hunt, Sandstorm Scuffle, Guild Duel, Guild Clash,
  Clash of Pallantis, Arctic Showdown — schedule, participation, and results
  (see §4a).
- Track **strongholds**: Sanctums and Desert Ruins — role assignments, levels,
  occupation windows, EXP/h, and buff values.
- Keep **history/trends** so we can see attendance, placements, rank changes,
  and stronghold status over time.

---

## 2. Tech stack

| Concern       | Choice                                             |
| ------------- | -------------------------------------------------- |
| Framework     | Next.js (App Router) + TypeScript                  |
| Auth          | Auth.js (NextAuth v5) + Discord provider           |
| Database      | Postgres on **Neon** (fast cold-starts)            |
| ORM           | **Drizzle** (+ Drizzle adapter for Auth.js)        |
| UI            | Tailwind CSS + shadcn/ui, dark theme, mobile-first |
| Hosting       | **Vercel** (Hobby / free tier)                     |
| Scale target  | ~100 members — keep queries/UI simple              |

---

## 3. Access control & roles

### Login gating
- Login is via **Discord OAuth**.
- Access is **gated to membership in VOID's Discord server** (checked via the
  `guilds` scope against the VOID server ID). Not in the server → blocked.
- **Everyone logs in** — every guild member signs in with Discord; their roster
  row auto-links (see §5).

### App permission roles
Three app roles, separate from in-game rank:
- **Admin** — full control, incl. assigning roles. Site owner.
- **Officer** — edit members, events, strongholds.
- **Member** — read-only + self-edit own profile.

### Auto-assign from Discord roles
- On each login we read the user's roles **within VOID's server** (needs the
  `guilds.members.read` scope) and map Discord role IDs → app roles via a
  configurable role map.
- **Precedence:**
  1. `ADMIN_DISCORD_IDS` env → always Admin (failsafe, can't lock yourself out).
  2. Discord role map → the normal path.
  3. Optional **manual pinned override** in the admin page (ignores Discord for
     that user). Off by default.
- Role changes reflect **at next login** (that's when Discord is re-read).

### In-game guild rank (separate concept)
- In-game rank is **R1 → R5** (R5 highest), stored as a roster field.
- Typical distribution: **1× R5** (Guildmaster), **8× R4** (officers),
  **91× R1–R3** = ~100 members.
- **Default rank → permission mapping:**
  - **R4 & R5 → Officer** (same permissions).
  - **R1–R3 → Member.**
  - **R5** additionally carries a **"Guildmaster"** title/marker (cosmetic +
    dashboard highlight, no extra permissions beyond Officer).
- In-game rank and app permission are **independent axes that do diverge in
  practice**: the site owner (`aeiti`) is **R4 in game but Admin in the app**,
  while the R5 guildmaster (`Kitsune`) holds Officer permissions. The UI must
  never style app role and in-game rank alike — see
  [`docs/components.md`](docs/components.md) §5.4.

### Field-level edit permissions

| Field                                                        | Member (self) | Officer / Admin |
| ----------------------------------------------------------- | ------------- | --------------- |
| Online windows, timezone, sandstorm pref, power, level, notes | ✅ edit own   | ✅ edit anyone  |
| In-game rank (R1–R5), status (Active/LOA/Inactive)          | ❌ view only  | ✅              |
| Strongholds, events, participation                          | ❌            | ✅              |
| App roles (promote to Officer/Admin)                        | ❌            | Admin only      |

---

## 4. Modules

> Terminology and mechanics below are verified against in-game screenshots —
> see [`docs/game-data.md`](docs/game-data.md) for the evidence.

- **Dashboard** — member count & rank distribution (R5/R4/R3/R2/R1), upcoming
  events, **live totals** (desert EXP/h + the guild buff stack), coverage
  warnings (empty Guardian/Governor slots, buildings about to open),
  and participation snapshots.
- **Members** — roster with R1–R5; members self-edit own profile, officers edit
  all; Discord auto-link; filter/sort/search; JSON export.
- **Strongholds** — two categories, **6 each**:
  - **Sanctums** — level 1–6, type (Goldglade / Woodsong / Steelstory /
    Craftsman Chancel / Scholar Sacrarium), **Guardian ×1 + Governors
    (capacity scales with level) + Sentries 0–5**, buffs, EXP/h, X/Y coords,
    occupier, death rate, **open/close window countdown**.
  - **Desert Ruins** — level 1–3, EXP/h, coords. No roles, no buffs.
  - Derived: **total EXP/h** and the **stacked buff totals**, plus gap
    detection (e.g. VOID holds no Woodsong/Scholar → zero lumber & research).
- **Events** — six guild events with per-type fields (see §4a). Schedule shown
  in **server time (UTC−2) + viewer local**. Reminder hooks stubbed (see §7).
- **Trends** — participation rate, donations & kills (rankings + trend),
  sandstorm points/W-L/%, roster size, average power, plus a per-event
  **participation matrix**. (Sanctum control/uptime dropped — not important.)
- **Admin** — user list + role assignment/pinning; role-map config.
- **Settings / Data** — game server timezone (**UTC−2**) shown alongside each
  viewer's local time; JSON export backup.

---

## 4a. Event types & their fields

All six are guild events; each has a distinct shape, so `typeFields` is typed
per event rather than free-form.

| Event | Cadence | Per-event fields | Per-member contribution |
| --- | --- | --- | --- |
| **Guild Hunt** | ongoing | boss (Subterranean Lizard), **trap level** (defeating unlocks next), total guild damage vs threshold, MVP | **damage dealt** ✅ leaderboard |
| **Sandstorm Scuffle** | weekly | **Skirmish Squad A / B** (separate roster *and* schedule, 30 starters, Camp ≥15, one squad per player, A final / B cancelable), 40-min battle, opponent, **guild points**, win/loss | **personal points**: overall / kills / healing / deployment ✅ |
| **Guild Duel** (GVG) | 6 days, Mon–Sat | fixed **theme per weekday**, **victory points/day** (1/2/2/2/2/4), **daily MVP**, daily winner, weekly tally, opponent | **personal points** daily & weekly ✅ |
| **Guild Clash** | season, Weeks 1–4 | tier (Diamond), guild rank, cumulative guild points | rolls up from Guild Duel |
| **Clash of Pallantis** | weekly, cross-server | phases (Prep Mon → Invasion Prep Fri 00:00 → Battle Fri 12:00 → Settlement), matched Pallantis, result | **Temple Points** ✅ |
| **Arctic Showdown** | multi-week | registration (GM/R4 pick **5–30 defenders**), qualifiers → **top 16** → knockout, placement | ❓ roster/bracket not yet captured |

**Registration authority:** Sandstorm and Arctic Showdown sign-ups are
restricted in-game to **guildmaster and R4 officers** — mirror that in app
permissions.

---

## 5. Data model (draft)

### Current-state tables
```
users        { id, discordId, name, image, role (admin|officer|member), rolePinned }

Member       { id, discordId?, ign, guildRank (R1..R5), isGuildmaster,
               timezone, onlineWindows[], sandstormSquad (A|B|null),
               power, level, status (active|LOA|inactive),
               lastSeenBucket,       ← see §5a; bucketed, NOT a datetime
               lastSeenObservedAt,   ← when the bucket was captured
               donations, kills,
               notes }

Event        { id, type, title, startsAt, recurrence, notes,
               serverTime,           ← authoritative; UTC-2
               opponent?, result?, typeFields{} }   ← typed per §4a

Participation{ id, eventId, memberId, signedUp, participated,
               squad (A|B|null),     ← Sandstorm only
               metric,               ← damage | personalPoints | templePoints
               value, subScores{}    ← e.g. kills/healing/deployment
             }

Stronghold   { id, category (sanctum|desertRuin), buildingType, level,
               coordX, coordY, occupier, deathRate,
               expPerHour,           ← derived from category+level
               buffs[{ type, value }],
               guardianId,           ← sanctum only
               governorIds[],        ← capacity scales with level
               opensAt, closesAt,    ← occupation window
               notes }
```

**Derived, not stored:** total EXP/h, stacked buff totals, and buff-coverage
gaps — all computed from the Stronghold rows so they can't drift.

### History / trends (append-only, timestamped)
```
EventResultHistory      — placements, sandstorm points & W-L, duel victory points
ParticipationHistory    — per-event per-member contribution → rate & matrix
DonationHistory         — per-member donations per period → rankings & trend
KillHistory             — per-member kills per period → rankings & trend
RankChangeLog           — member R1..R5 (and power) changes over time
StrongholdHistory       — occupier / level / role-assignment changes
GuildClashHistory       — season rank & tier per week
AuditLog                — who changed what
```

### Member ↔ login linking
- `users` (auth identity + app role) and `Member` (roster data) are **separate
  tables linked by `discordId`**.
- On login: match `Member` by `discordId`; if none, **auto-create** one (seeded
  with Discord name/avatar, blank game fields).
- Officers can **pre-create** roster rows (with a `discordId`) for recruits;
  the row links automatically when that person first logs in.

---

## 5a. Metrics & attendance model

### Two separate "attendance" concepts (do not conflate)

**1. Activity — "Last Seen."** The Guildmates roster shows an **online status
bucket**, not a timestamp:

```
Online · Offline <N> min · Offline <N>h · Offline 1d / 2d
· Offline for over 3d · Offline for over 7d · Offline for over 30d
```

Resolution therefore **degrades past ~2 days** and is capped at "over 30d".
Store the **observed bucket + capture timestamp**, never a synthesised
datetime — deriving `lastSeenAt = now − delta` would invent precision the game
never gave us. Buckets map to the pruning watchlist: **Active** (Online…2d) /
**Idle** (over 3d, over 7d) / **Inactive** (over 30d). This says they *opened
the game* — not that they showed up for anything.

**2. Event participation.** Who actually contributed to an event. The game
*does* publish per-member contribution boards, one per event (§4a) — so this is
transcribed from results screens rather than guessed:

| Event | Board | Metric |
| --- | --- | --- |
| Guild Hunt | Rewards → Guild | damage dealt (+ MVP ×10) |
| Sandstorm | Personal Point Rankings | points; kills / healing / deployment |
| Guild Duel | Rankings (Daily/Weekly) | personal points |
| Clash of Pallantis | Rewards → Rankings | Temple Points |

Yields the true **participation rate** = events contributed to ÷ events held,
plus the **participation matrix** (members × events) and per-event value.

### Tracked metrics
- Participation rate (30-day), participation matrix, participation streaks.
- Donations — per-member rankings + guild weekly trend.
- Kills (kill points) — per-member rankings + guild weekly trend.
- Sandstorm — points scored, win/loss, win %.
- Guild Duel — victory points/day, MVP count, weekly tally, win rate.
- Guild Clash — season rank & tier over Weeks 1–4.
- Roster size, average power, biggest power gainers/decliners.
- Strongholds — total EXP/h and buff stack over time; buff-coverage gaps.

### KPIs confirmed for v1
- **Contribution Score** — single weighted composite for promotion/pruning
  decisions. **Priority: event participation ≫ kills > donations**, event-results
  a modest add-on. Weights live in `lib/metrics.ts`, tunable in one place
  (numbers are a starting point to retune on real data).
- **Participation streaks** — consecutive events contributed to.
- **Timezone coverage** — 24h defense-readiness band (roster spans UTC−8…UTC+9).

Component homes for these are in [`docs/components.md`](docs/components.md) §3.8.
Deferred: new-vs-churned per week, rank-movement log (schema supports them via
`RankChangeLog`; build later).

---

## 6. Build order

1. Scaffold — Next.js + Tailwind + shadcn + Drizzle + Neon connection.
2. Auth.js + Discord login + server gating + role map + route protection.
3. **Members** module.
4. **Strongholds** module.
5. **Events** module (placeholder, expandable).
6. **Dashboard.**
7. **Trends.**
8. **Admin** (user/role management).

History tables land alongside their module so trends accrue from day one.

---

## 7. Deferred (schema-ready, build later)

- **Discord webhook reminders** — post event reminders / sign-up nudges to a
  channel.
- Recruitment / trial status for new members.
- Member lineup / key-Palmon notes for event planning.
- Allied-guild / GVG-opponent tracking.
- Custom domain.

---

## 8. Go-live inputs (needed before deploy)

The auth + DB layer is **written and dormant** — see
[`docs/auth-setup.md`](docs/auth-setup.md) for the step-by-step activation.
Supply these (into `.env`, copied from `.env.example`):

- Discord application: client ID, client secret, redirect URL.
- VOID Discord **server (guild) ID**.
- Discord **role IDs** for R4/R5 (Officer) and any Admin role, for the role map.
- Neon database URL.
- Auth.js secret.
- Your **admin Discord ID** (`ADMIN_DISCORD_IDS`).

Then `npm run db:push` and rename `middleware.ts.example` → `middleware.ts`.

---

## 9. Open items / TBD

Screenshots are captured and mechanics are resolved — see
[`docs/game-data.md`](docs/game-data.md). What remains:

- **Arctic Showdown** roster/registration and bracket screens — user has no
  access yet, so its per-member contribution metric is still unknown.
- ~~Confirm which candidate KPIs to build~~ — **done: Contribution Score,
  participation streaks, timezone coverage** (see §5a). Contribution Score
  weights still need tuning once real data exists.
- Deferred by the user, not blocking: Guildmates **Groups** tab, Sandstorm
  **registration** screen, **Rank → Power / Kills** tabs.
- Minor: the ~1% Construction delta between the sanctum buff sum (+20%) and the
  reported in-game total (+21%).
