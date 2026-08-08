# Palmon: Survival — Game Data Reference

Extracted from in-game screenshots (`docs/screenshots/`) plus user-provided
intel. This is the source of truth for the app's data models and event fields.

> **Confidence key:** ✅ verified from a screenshot · 📋 user-provided /
> attested · ❓ still unknown.

---

## 1. Terminology corrections

These differ from the initial plan and supersede it:

| Plan said | Game actually says |
| --------- | ------------------ |
| "Shrines = Ruins, use Ruins" | ✅ **Sanctum** and **Desert Ruins** are two tabs under **Guild Strongholds**. "Shrine" is part of individual *sanctum names* (Goldglade Shrine, Steelstory Shrine) — it is **not** a synonym for Ruins. |
| "Sandstorm slots A/B" | ✅ **Skirmish Squad A / Squad B** — each squad has its own roster *and* schedule. |
| "GVG" | ✅ **Guild Duel** (with a **Guild Clash** season leaderboard). |
| "Temple" | ✅ **Clash of Pallantis** (scored in **Temple Points**). |
| "Ruins provide no buffs" | ✅ Correct on buffs, but ruins **do** produce desert EXP/h. |

---

## 2. Guild roster (Guildmates screen) ✅

Tabs: **Members** / **Rank** / **Groups**. Rank sub-tabs: **Power**,
**Donations**, **Kills**.

**Per-member fields visible:** avatar, name, in-game rank (R1–R5), **Power**,
**Level**, and **online status**.

**Online status is bucketed, not exact** — this constrains the "Last Seen"
metric:

```
Online · Offline <N> min · Offline <N>h · Offline 1d / 2d
· Offline for over 3d · Offline for over 7d · Offline for over 30d
```

So last-seen resolution degrades past ~2 days. Store the **observed bucket +
capture timestamp**, not a false-precision datetime.

**VOID composition** ✅ (49 members): R5 ×1 · R4 ×7 (of 8 slots) · R3 ×33 ·
R2 ×6 · R1 ×2. Guildmaster: **Kitsune**. Levels ~26–31, power ~124M–809M.

---

## 3. Guild Strongholds ✅

Two tabs, each capped at **6 buildings**, each showing a combined EXP/h total.

Strongholds provide **two things at once**: desert EXP/h (guild-wide, feeds
Desert Sovereignty progression and desert tech) *and* guild-wide buffs.

### Sanctums
**List view** shows: **Level (1–6)**, **name/type**, **Guardian** (1),
**Governors** (*capacity scales with level* — 2/2 at L4–L6, 1/1 at L3),
**Sentries (0–5)**, **EXP/h**, **X/Y coordinates**, 4 buff icons.
Footer: `Occupied Today: 0/3` · `Sanctums Occupied: 6/6`.

**Detail view** (tap on map) ✅ shows: coords, level, name, **Occupier**
(guild), **Guardian**, **Death Rate 20.0%**, **Occupation Buffs** (text),
**EXP/h**, and an **`Opens In:` countdown** with View / Protect actions.

**EXP/h by level** ✅: sanctums L1–L6 = 200 / 400 / 600 / 900 / 1200 / 1500.
Ruins L1–L3 = 300 / 600 / 900.

**Buff scaling L1–L5** ✅: 3% / 5% / 10% / 15% / 20%. Resource shrines grant
**their resource output _and_ Harvesting Speed (All Resources)** at that rate.
**L6 grants a flat +20% specialty instead.**

| Sanctum type | Buff |
| --- | --- |
| Goldglade Shrine | Gold Output + Harvesting Speed |
| Woodsong Shrine | Lumber Output + Harvesting Speed |
| Steelstory Shrine | Steel Output + Harvesting Speed |
| Craftsman Chancel (L6) | Construction Speed +20% |
| Scholar Sacrarium (L6) | Tech Research Speed +20% |

Same-type buffs **stack additively**.

**Occupation rules** ✅📋: 6 sanctums + 6 ruins cap · **3 occupations/day per
category** · scheduled open/close windows with ceasefire timers (takeovers are
planned affairs) · 1 guardian + 2 governors + up to 5 sentries · Death Rate
20% · unclaimed buildings held by NPC **"Genetek"**, gated by desert tolerance
(9,500 in observed zones).

### VOID's portfolio ✅ — 9,600/h total
Sanctums 5,700/h — every buff below verified from its detail screen:

| Sanctum | Lvl | EXP/h | Coords | Guardian | Occupation buffs |
| --- | --- | --- | --- | --- | --- |
| Craftsman Chancel | 6 | 1500 | 485,602 | Kitsune | Construction Speed +20% |
| Goldglade Shrine | 5 | 1200 | 485,712 | mvgda | Gold +20%, Harvesting +20% |
| Steelstory Shrine | 4 | 900 | 354,482 | GRIM | Steel +15%, Harvesting +15% |
| Goldglade Shrine | 4 | 900 | 354,712 | Lprdgddss | Gold +15%, Harvesting +15% |
| Steelstory Shrine | 3 | 600 | 207,602 | Janey×³ | Steel +10%, Harvesting +10% |
| Goldglade Shrine | 3 | 600 | 207,849 | ShenH | Gold +10%, Harvesting +10% |

Ruins 3,900/h: L3 ×2, L2 ×3, L1 ×1.

**Active buff stack** — the sum checks out exactly:
Gold **+45%** (20+15+10) · Steel **+25%** (15+10) · Harvesting **+70%**
(20+15+15+10+10) · Construction **+20%** (📋 user reports +21% in-game, so ~1%
comes from another source). **Zero lumber, zero research coverage** — VOID
holds no Woodsong and no Scholar.

### Rival portfolios 📋
- **WAR** — 9,600/h: Scholar 6, Woodsong 5/4/3, Steelstory 4/3 + same ruins spread
- **RotR** — 9,900/h: Scholar 6, Woodsong 5, Steelstory 4/4, Goldglade 4/3 + same ruins

All three guilds sit within 300/h of each other because the map is saturated —
everyone holds low-level dregs since nothing better is available to take.

---

## 4. Events

### Guild Duel (GVG) ✅
6-day event, **fixed theme per weekday**:

| Day | Theme | Victory Points |
| --- | --- | --- |
| Mon | Complete Intel Quests | 1 |
| Tue | Build Up Your Camp | 2 |
| Wed | Research Techs | 2 |
| Thu | Upgrade Palmon | 2 |
| Fri | Prepare for Battle | 2 |
| Sat | Defeat Enemies | 4 |

Tabs: **Today's Theme** / **Duel Status** / **Guild Clash**. Per day the game
records **victory points**, an **MVP** (a member), and a **winner** (guild
tag). Weekly tally shown as `0:9`. Members ranked daily & weekly by **personal
points**; personal points also contribute guild points.

**Guild Clash** ✅ — season leaderboard, **Diamond Tier**, columns Week 1–4.
VOID ranked **#8** with 1,523,448,922.

### Sandstorm Scuffle ✅
Two matched guilds, **40-minute** battle. Winner = higher **Guild Points**;
members also earn **Personal Points**.

- **Registration**: opens Thursday of battle week, lasts 1 day. Requires
  **10+ votes**. Only **guildmaster and R4 officers** can sign up.
- **30 starters** per squad; participants need **Camp level ≥15**; selected
  explorers can't leave/be removed.
- **Skirmish Squad A/B**: up to two squads, each with own roster *and*
  schedule. Each explorer joins **only one**. **Squad A registration is final;
  Squad B can be canceled.**
- **Matchmaking**: total historical power + past performance; A and B matched
  independently but share a pool.
- **Battle stages**: 0–3 min prep (no dispatch, can place pins) · 3 min Solar
  Vaults · 8 min War Altars · 11 min Healing Oases · 15 min Miracle Temple ·
  40 min end.
- **Post-battle rankings** ✅: **Personal Point Rankings** per squad, with tabs
  **Overall / Kill Rankings / Healing Rankings / Deployment**. This is the
  participation source for Sandstorm.

### Clash of Pallantis (Temple) ✅
Cross-server. Two matched Pallantis open a channel; protect your Temple while
capturing the enemy's. Phases: **Prep** (Mon 00:00) → **Invasion Prep** (Fri
00:00–12:00, no Temple points) → **Battle** (Fri 12:00–end) → **Settlement**
(→ Fri 24:00, personal points only). Scored in **Temple Points**; rankings are
cross-guild and lock when a winner is crowned.

### Arctic Showdown ✅
Multi-week tournament. Registration Sat–Sun Week 1; **guildmaster or R4 select
5–30 combatants as defenders**. Qualifiers → **top 16 advance** → knockout
rounds daily until a champion is determined.

### Guild Hunt ✅
Set a guild trap for a **Subterranean Lizard** at a level; defeating the
current level **unlocks the next level trap**. Progression track (observed at
**Lvl 10**), not a placement.

**Rewards screen** ✅ — tabs **Guild / Personal / Damage Rewards**:
- **Total Guild Damage** against a threshold bar
  (observed `1,878,914,700,235 / 50,000,000,000`)
- **MVP Bonus ×10** banner
- **Per-member damage leaderboard** (~40 ranked): αειτι 421.3B (MVP),
  Lprdgddss 224.4B, Kitsune 157.4B, Hormuz 130.5B, ShenH 123.7B … down to
  ~1.6B.

This leaderboard is the **participation source for Guild Hunt** — damage
contributed per member, per hunt.

### Events Calendar ✅
Gantt-style week view with a server clock (`2026/08/08 03:11:24`). Also lists
non-guild events: Super Savers, Front of the Pack, Wheel of Fortune,
Wyrmslayer, Apex Showdown, Jackpot Bargain, Wheel of Wealth.

---

## 5. Server 111 landscape 📋

| Guild | Power | Members | Notes |
| --- | --- | --- | --- |
| EOC | 42.3B | 99 | Dominant #1 |
| RotR | 21.2B | 61 | R5 M3WTW0 (664M); ~21-member weak tail |
| **VOID** | **21.1B** | **49** | ~36 active/24h; 41 weekly GvG scorers (~1.26B pts/wk); tech #2 |
| WAR | 7.3B | 23 | R5 Malax (555M); top 5 all >550M; ~14 active |

**Genetek** = NPC default occupier of unclaimed strongholds, not a real guild.

Other guild stronghold portfolios: **WAR** 9,600/h · **RotR** 9,900/h.

---

## 6. Guild tech (Futuristic tier) 📋

- **Maxed**: Amazing Aid IV (aid queue +4, cap 26) · Speedy Support III (+180
  aid time reduction) · Team Building III (+3% build speed) · Brainstorm III
  (+3% research speed)
- **In progress**: Hastened Harvesting II (212,820/1,228,800, priority) ·
  Mutual Might I (568,320/1,474,560) · Undying Unity I (268,080/1,228,800) ·
  Shared Shield I (240/1,228,800)
- **Not started**: Gold Rush III · Timber Titan III · Ferrous Fever III
  (983,040 each)
- Outstanding in tier: **~8M+ EXP**
- **Donations**: 5 gems (no limit) or 1k gold + 1k lumber (20/day) → 60 tech
  EXP each

---

## 7. Other systems 📋

- **Rally / gift economy**: unlimited initiations (20 AP each); auto-fill;
  participation rewards capped 20/day; gifts uncapped. Initiator haul (L57
  beast) ~5M value. Observed 60–100+ defeats/day, 14+ distinct initiators;
  passive gift income ~600k–1M/member/day.
- **Guild Aid**: 26 helps/item cap, ~1.1h saved each.
- **Treasure Hunt**: 5 assists + 5 raids/day; ~200k mineral + 75k secondary
  per assist.

---

## 8. Server time ✅

The in-game top bar reads **`UTC-2 08/08 03:34`** — confirming the game server
runs on **UTC−2**. The app shows every event time in server time alongside the
viewer's local time.

---

## 9. Merger scenarios 📋 (draft v7.1)

Strategic context, not app scope — but it explains why stronghold and
participation tracking matter.

- **A (WAR)**: 49 → ~72 members, ~50 active, 28.4B power. GvG +280–420M/wk
  est., strongholds +1,200/h (even split) to +2,400/h (priority pick — take
  their L6 Scholar + L5 Woodsong, drop VOID's worst). Adds **Tech Research
  +20%** and **Lumber +20%** (both currently zero), lifts Harvesting
  +70% → +90%. Ghost = R4 candidate; Malax open question; 1-week trial;
  conduct-agreement gate.
- **B (RotR)**: ~110 → 100 (~10 cuts), ~40.5B, ~2× GvG gain. R5 stays with
  Kitsune, M3WTW0 offered R4. Long game — not being pushed.

---

## 10. Open questions ❓

Deferred by the user (no access right now): Guildmates **Groups** tab,
Sandstorm **registration** screen, **Rank → Power / Kills** tabs, **Arctic
Showdown** roster & bracket.

Still estimated rather than verified:
- WAR per-player GvG averages (screenshot their board when drawn as opponent)
- WAR / RotR tech levels
- Tech-ranking order (user-attested)
- The ~1% Construction delta between the sanctum sum (+20%) and the reported
  in-game total (+21%)
