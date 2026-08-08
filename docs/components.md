# Component Spec

The shared vocabulary for the VOID guild manager UI. Everything on the site is
built from these; if a screen needs something not listed here, add it here
first so it gets reused rather than reinvented.

Baseline: **Tailwind + shadcn/ui**. shadcn gives us unstyled-but-accessible
primitives we own the source of, so we restyle them once against our tokens
instead of fighting a theme. Domain components (§3) are ours.

---

## 1. Foundations

### 1.1 Color tokens

Defined once as CSS variables, consumed only through semantic names — never
raw hex in a component.

| Token | Value | Use |
| --- | --- | --- |
| `--void` | `#0B0B12` | page ground |
| `--surface` / `--surface-2` | `#14141F` / `#1C1C2B` | cards, raised controls |
| `--border` / `--border-2` | `#2A2A3D` / `#35354D` | hairlines, control borders |
| `--text` / `--text-2` / `--text-3` | `#ECEBF5` / `#B4B2CC` / `#86849E` | primary / secondary / muted |
| `--violet` / `--violet-2` | `#A78BFA` / `#7C5CFC` | **primary & interactive** |
| `--desert` | `#E8A24C` | **reserved: desert EXP + buffs only** |
| `--good` / `--warn` / `--bad` | `#4ADE80` / `#FBBF24` / `#F87171` | state only |

**Three colour rules, and they are load-bearing:**

1. **Violet = interactive.** If it's violet, you can click it (or it's the
   primary accent of the brand). Never use violet for state.
2. **Desert amber = desert EXP and buffs.** Nothing else. This is what lets a
   user scan a page and instantly find the economy numbers.
3. **Green/amber/red = state only** (held/contested/lost, active/idle/inactive,
   good/warning/critical). Never decorative.

Single dark theme, committed. Backgrounds are always painted explicitly.

### 1.2 Typography

| Role | Family | Notes |
| --- | --- | --- |
| Wordmark, labels, eyebrows | mono | uppercase, `letter-spacing: .16–.22em` |
| **All numeric data** | mono | `font-variant-numeric: tabular-nums` — mandatory |
| Body, headings | system sans | |

Scale: `xs .70 · sm .8125 · base .9375 · lg 1.0625 · xl 1.375 · 2xl 1.875 ·
3xl 2.5` (rem). Stay on it.

### 1.3 Spacing, radii, motion

- Space in multiples of 4; gaps via flex/grid `gap`, not per-child margins.
- Radii: `sm 8 · md 12 · lg 16`.
- Transitions ≤150ms on colour/border only. Everything respects
  `prefers-reduced-motion`.

---

## 2. Primitives (shadcn/ui, restyled)

`Button` (primary / secondary / ghost / danger; sm/md; icon slot) ·
`Input` `Textarea` `Select` `Combobox` `Checkbox` `Switch` `DatePicker` ·
`Dialog` `Sheet` `AlertDialog` `DropdownMenu` `Tooltip` `Toast` ·
`Tabs` `SegmentedControl` `Badge` `Avatar` `Skeleton` `ScrollArea` `Separator`

House rules layered on top:

- **Destructive actions** (delete a stronghold, remove a member) use
  `AlertDialog`, never a bare `Button`.
- **Toasts state the outcome**, past tense: "Governor assigned", not "Saving…".
- Every interactive element keeps a visible `:focus-visible` ring.

---

## 3. Domain components

These encode the rules from [`docs/game-data.md`](game-data.md). The point of
each is that a rule lives in **one** place.

### 3.1 Identity & roster

| Component | Signature | Notes |
| --- | --- | --- |
| `RankBadge` | `{ rank: 1..5, guildmaster?: boolean }` | R1–R5, coloured to match the game (R5 amber, R4 violet, R3 blue, R2 green, R1 grey). Guildmaster adds a crown — a **title marker, not a permission**. |
| `AppRoleBadge` | `{ role: 'admin'\|'officer'\|'member', source }` | Deliberately **visually distinct** from `RankBadge` — the two axes are independent (an R4 can hold Admin). `source` renders "Discord role" / "ENV allowlist" / "Pinned". |
| `StatusPill` | `{ status: 'active'\|'idle'\|'inactive' }` | Derived from the last-seen bucket, never hand-set. |
| `LastSeen` | `{ bucket, observedAt }` | **Renders the game's bucket verbatim** ("over 7d") and colours it. Tooltip shows when the bucket was captured. **Must never render a computed timestamp** — see §5. |
| `SquadBadge` | `{ squad: 'A'\|'B'\|null }` | Skirmish Squad. `null` renders an em dash, not "None". |
| `MemberChip` | `{ member, size, showRank? }` | Avatar + IGN. The one way a member is referenced anywhere. |
| `MemberPicker` | `{ value, onChange, exclude?, filter? }` | Combobox over the roster. `exclude` prevents double-assigning someone already holding a role on the same building. |

### 3.2 Strongholds

| Component | Signature | Notes |
| --- | --- | --- |
| `RoleSlot` | `{ role: 'guardian'\|'governor'\|'sentry', member?, locked?, canEdit }` | Three states: **filled**, **empty** (dashed red, "+ Assign"), **locked** (greyed, "locked — L4+") for governor slots the sanctum's level doesn't unlock yet. |
| `SentryTrack` | `{ filled: 0..5 }` | Five dots. Colour by fill: 0 red, 1–2 amber, 3+ green. |
| `BuffChip` | `{ type, value }` | Always desert amber. `value: 0` renders in red — an uncovered category is information, not absence. |
| `BuffStack` | `{ strongholds }` | **Computes** the additive totals and surfaces zero-coverage gaps. Never takes pre-summed values. |
| `ExpRate` | `{ perHour }` | `9,600/h`, tabular. |
| `StrongholdCard` | `{ stronghold, canEdit }` | Sanctum variant: level badge, buffs, role slots, EXP/h, sentries, death rate, opens-in. Ruin variant: level, EXP/h, coords only — **no role or buff affordances at all**. |
| `OccupationWindow` | `{ opensAt, closesAt }` | Countdown + open/closed state. |
| `Coords` | `{ x, y }` | `X:485 Y:602`, mono. |

### 3.3 Time

| Component | Signature | Notes |
| --- | --- | --- |
| `ServerClock` | — | Live pair: server (UTC−2) and viewer local. Header only. |
| `TimePair` | `{ serverTime, format? }` | **The only way an event time is ever rendered.** Always shows server time *and* local. Prevents a bare local time leaking into the UI. |
| `Countdown` | `{ to, onElapse? }` | Used by `OccupationWindow` and next-event tiles. |

### 3.4 Events

| Component | Signature | Notes |
| --- | --- | --- |
| `EventTypeIcon` | `{ type }` | One icon + colour per event type, defined once. |
| `EventBadge` | `{ type }` | Icon + label pill. |
| `EventCard` | `{ event }` | Shell + a per-type body (see below). |
| `EventBody.*` | — | One small component per event type — `GuildHunt`, `Sandstorm`, `GuildDuel`, `GuildClash`, `Pallantis`, `ArcticShowdown` — each rendering that event's real fields (§4a of PLAN.md). This is why `typeFields` is typed, not free-form. |
| `ContributionBoard` | `{ eventId, metric }` | Ranked per-member contribution for one event. `metric` drives the unit label (damage / personal points / Temple Points). |
| `ParticipationMatrix` | `{ members, events }` | Members × events, showing **contributed values**, not ticks. Non-participation renders as a muted dash. |

### 3.5 Data display

| Component | Signature | Notes |
| --- | --- | --- |
| `Metric` | `{ value, format: 'compact'\|'full'\|'percent', unit? }` | The single number formatter. `compact` gives `1.88T`, `421.3B`, `102.4M`. Always tabular. |
| `StatTile` | `{ label, value, unit?, foot?, accent?, spark? }` | Dashboard/KPI tile. |
| `DeltaIndicator` | `{ value, direction, inverted? }` | ▲/▼ with good/bad colour. `inverted` for metrics where lower is better (Guild Clash rank). |
| `DataTable` | `{ columns, rows, sort, ... }` | Sticky header, `overflow-x: auto`, tabular numerics, row hover. |
| `Leaderboard` | `{ entries, metric }` | Top-3 emphasis, rank, `MemberChip`, value. |
| `ProgressBar` | `{ value, max, variant }` | |
| `Sparkline` / `AreaChart` / `BarSeries` | — | Inline SVG. Faint grid, emphasised endpoint, area fill. |
| `DistributionBar` | `{ segments }` | The R5→R1 rank bar. |
| `WarningItem` | `{ severity, title, detail, href? }` | Severity stripe + text. Feeds "Needs Attention". |

### 3.6 Layout & state

`AppShell` (nav rail → mobile bottom bar) · `PageHeader` `{ eyebrow, title,
sub, actions }` · `SectionTitle` · `Card` / `CardHead` / `CardBody` ·
`EmptyState` · `ErrorState` · `LoadingState`

**Every data-backed view ships all four states** — loading, empty, error,
loaded. An empty roster and a failed fetch must not look the same.

### 3.7 Permissions

| Component | Signature | Notes |
| --- | --- | --- |
| `useCan()` | `useCan('edit', 'member.rank', member)` | Single source for the §3 permission table in PLAN.md. |
| `PermissionGate` | `{ can, children, fallback? }` | Hides or disables. |
| `EditableField` | `{ value, canEdit, onSave, render }` | Read-only text when not permitted; inline edit when permitted. Keeps "who may edit what" out of every form. |

---

## 4. File layout

```
components/
  ui/          shadcn primitives (owned, restyled)
  domain/      §3 — member/, stronghold/, event/, time/, data/
  layout/      AppShell, PageHeader, nav
lib/
  format.ts    number/time formatting — the ONLY place
  permissions.ts
  game/        EXP tables, buff scaling, bucket→status maps
```

`lib/game/` holds the rules from `docs/game-data.md` as data (EXP per level,
buff scaling, governor capacity per level, bucket definitions) so components
stay dumb and the tables stay checkable against the screenshots.

---

## 5. Conventions that prevent real bugs

1. **Never invent precision.** The game gives buckets ("over 7d") and rounded
   values. Render what it gave us. `LastSeen` enforces this.
2. **Derived values are computed, never stored or passed pre-summed.** EXP/h
   totals and buff stacks come from the stronghold rows, so the dashboard
   cannot drift from the detail pages.
3. **Every event time goes through `TimePair`.** Server time is authoritative;
   local is a convenience. A bare local time is a bug.
4. **In-game rank ≠ app role.** `RankBadge` and `AppRoleBadge` never share a
   style. (You are R4 with Admin — the case that proves it.)
5. **Empty vs zero vs unknown are three different things.** `0%` buff coverage
   is a red chip; an unassigned governor is a dashed slot; an unlocked-later
   governor slot is greyed; missing data is an em dash.
6. **Compact numbers everywhere**, full precision in tooltips.

---

## 6. Build order for the component layer

1. Tokens + Tailwind config + `lib/format.ts`.
2. shadcn primitives, restyled.
3. `AppShell`, `PageHeader`, `Card`, the four state components.
4. Member set (`RankBadge`, `StatusPill`, `LastSeen`, `MemberChip`,
   `MemberPicker`) — everything else references members.
5. Stronghold set.
6. Time set.
7. Event set.
8. Data-display set (charts last — they're the least load-bearing).

---

## 7. Open decisions

- **Charts**: hand-rolled inline SVG (as in the mockup — zero deps, full token
  control) vs Recharts (faster to build, heavier, harder to theme).
  Recommendation: **inline SVG**, since our charts are simple and few.
- **Tables**: plain `DataTable` vs TanStack Table. At ~50 rows, plain is
  enough; TanStack only if we want column resize/virtualisation later.
- **Icons**: Lucide (matches shadcn) vs the hand-drawn set in the mockup.
  Recommendation: **Lucide for UI chrome, custom for event types**, since the
  event icons carry meaning Lucide doesn't have.
