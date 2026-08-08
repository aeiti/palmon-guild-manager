# VOID Guild Manager — Plan

A guild management website for the **Palmon: Survival** guild **VOID**. Tracks
members, events, and strongholds, with Discord-based login and trend history.

> Status: **planning + UI mockup review, pre-build.** This document is the
> living reference spec. Build begins on explicit go-ahead.
>
> UI mockup: [`mockups/void-mockup.html`](mockups/void-mockup.html) — open in a
> browser to click through Dashboard / Members / Strongholds / Events / Trends /
> Admin (sample data, design direction locked to a dark "survival HUD").

---

## 1. Goals

- Track **members**: in-game rank, usual online times, preferred sandstorm slot,
  power/level, status, notes.
- Manage **events**: Temple, Guild Hunt, Sandstorm (slots A & B), Arctic
  Showdown, GVG — schedule, attendance, and VOID's placement/result.
  (Per-event-type details TBD from in-game screenshots; built as a flexible
  placeholder first.)
- Track **strongholds**: Sanctums and Ruins, including assignments, held/
  contested/lost status, and buff values.
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
- In-game rank and app permission are independent axes and can diverge when
  needed.

### Field-level edit permissions

| Field                                                        | Member (self) | Officer / Admin |
| ----------------------------------------------------------- | ------------- | --------------- |
| Online windows, timezone, sandstorm pref, power, level, notes | ✅ edit own   | ✅ edit anyone  |
| In-game rank (R1–R5), status (Active/LOA/Inactive)          | ❌ view only  | ✅              |
| Strongholds, events, participation                          | ❌            | ✅              |
| App roles (promote to Officer/Admin)                        | ❌            | Admin only      |

---

## 4. Modules

- **Dashboard** — member count & rank distribution (R5/R4/R1–3), upcoming
  events, **live buff totals** (guild amity + desert XP from held sanctums),
  coverage warnings (empty Guardian/Governor, contested strongholds), and
  attendance/trend snapshots.
- **Members** — roster with R1–R5; members self-edit own profile, officers edit
  all; Discord auto-link; filter/sort/search; JSON export.
- **Strongholds** — full depth: Sanctums (buffs with values, Guardian + 2
  Governors, held/contested/lost status) and Ruins (aka Shrines — we use
  "Ruins"; no buffs). Status changes logged for history.
- **Events** — placeholder-but-usable: type, schedule/recurrence, notes,
  flexible `typeFields` bag, attendance, and **VOID placement/result**. Expands
  from screenshots. Reminder hooks stubbed (see §7).
- **Trends** — participation rate, donations & kills (rankings + trend),
  sandstorm points/W-L/%, roster size, average power, plus a per-event
  **participation matrix**. (Sanctum control/uptime dropped — not important.)
- **Admin** — user list + role assignment/pinning; role-map config.
- **Settings / Data** — game server timezone (**UTC−2**) shown alongside each
  viewer's local time; JSON export backup.

---

## 5. Data model (draft)

### Current-state tables
```
users        { id, discordId, name, image, role (admin|officer|member), rolePinned }
Member       { id, discordId?, ign, guildRank (R1..R5), isGuildmaster,
               timezone, onlineWindows[], sandstormPref (A|B|null),
               power, level, status (active|LOA|inactive),
               lastSeenAt,           ← from in-game "time since last login"
               donations, kills,     ← current cumulative / weekly stats
               notes }
Event        { id, type, title, startsAt, recurrence, notes, typeFields{},
               placement/result }    ← Sandstorm typeFields: points, win/loss, slot
Participation{ id, eventId, memberId, signedUp, attended, slot, result }
Stronghold   { id, kind (sanctum|ruin), name, status (held|contested|lost),
               buffs[{ type: amity|desertXp|..., value }],
               guardianId, governorIds[2], notes }
```

### History / trends (append-only, timestamped)
```
EventResultHistory      — VOID placements / sandstorm points & W-L over time
ParticipationHistory    — per-event attendance log → participation rate & matrix
DonationHistory         — per-member donations per period → rankings & trend
KillHistory             — per-member kills per period → rankings & trend
RankChangeLog           — member R1..R5 (and power) changes over time
StrongholdStatusHistory — held/contested/lost transitions
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
1. **Activity — "Last Seen."** Derived from the game's *time since last login*.
   An officer records it periodically; store `lastSeenAt = capture time −
   reported delta`. Auto-derives buckets: **Active ≤7d / Idle 8–14d /
   Inactive >14d** for the pruning watchlist. Tells you they opened the game —
   *not* that they showed up.
2. **Event participation.** Who actually took part in an event. Not exported by
   the game, so **logged per event** (officer check-off / results screenshot).
   Yields the true **participation rate** = events attended ÷ events held (per
   member and guild-wide) and the **participation matrix** (members × events).

### Tracked metrics
- Participation rate (30-day), participation matrix, attendance streaks.
- Donations — per-member rankings + guild weekly trend.
- Kills (kill points) — per-member rankings + guild weekly trend.
- Sandstorm — points scored, win/loss, win %.
- Roster size, average power, biggest power gainers/decliners.
- GVG record / win rate; per-event result history (Temple floor, Arctic
  placement, Guild Hunt damage).

### Candidate KPIs (proposed, not yet confirmed)
- **Contribution Score** — single weighted composite (participation +
  donations + kills + event results) for promotion/pruning decisions.
- Attendance streaks; timezone coverage (24h defense readiness);
  new-vs-churned members per week; rank-movement log.

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

## 8. Go-live inputs (needed before deploy, walkthrough provided later)

- Discord application: client ID, client secret, redirect URL.
- VOID Discord **server (guild) ID**.
- Discord **role IDs** for R4/R5 (Officer) and any Admin role, for the role map.
- Neon database URL.
- Auth.js secret.
- Your **admin Discord ID** (`ADMIN_DISCORD_IDS`).

---

## 9. Open items / TBD

- **In-game screenshots pending** — drop into `docs/screenshots/` (or attach in
  chat). Needed to finalize per-event-type fields, sandstorm mechanics, and
  sanctum buff values.
- Per-event-type field details (from screenshots).
- Exact sandstorm mechanics — preference + points/W-L tracked; per-run slot
  assignment and coverage view TBD from screenshots.
- Which buffs sanctums provide beyond guild amity + desert XP, and their values.
- Confirm which candidate KPIs from §5a to build (recommendation: Contribution
  Score + attendance streaks + timezone coverage).
