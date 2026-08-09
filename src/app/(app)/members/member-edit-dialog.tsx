"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Member, LastSeenBucket } from "@/lib/game/types";
import { updateMember, type MemberPatch } from "@/lib/actions/members";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const selectCls =
  "h-10 w-full rounded-md border border-border-2 bg-surface px-2 text-sm text-text outline-none focus-visible:border-violet/60";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[0.65rem] uppercase tracking-wide text-text-3">
        {label}
      </span>
      {children}
    </label>
  );
}

// Encode/decode the last-seen bucket for the two-control editor.
type BucketKind =
  | "online"
  | "minutes"
  | "hours"
  | "days1"
  | "days2"
  | "over3"
  | "over7"
  | "over30";

function bucketToForm(b: LastSeenBucket): { kind: BucketKind; n: number } {
  switch (b.kind) {
    case "online":
      return { kind: "online", n: 0 };
    case "minutes":
      return { kind: "minutes", n: b.n };
    case "hours":
      return { kind: "hours", n: b.n };
    case "days":
      return { kind: b.n === 1 ? "days1" : "days2", n: 0 };
    case "over":
      return { kind: `over${b.days}` as BucketKind, n: 0 };
  }
}

function formToBucket(kind: BucketKind, n: number): LastSeenBucket {
  switch (kind) {
    case "online":
      return { kind: "online" };
    case "minutes":
      return { kind: "minutes", n: Math.max(0, n) };
    case "hours":
      return { kind: "hours", n: Math.max(0, n) };
    case "days1":
      return { kind: "days", n: 1 };
    case "days2":
      return { kind: "days", n: 2 };
    case "over3":
      return { kind: "over", days: 3 };
    case "over7":
      return { kind: "over", days: 7 };
    case "over30":
      return { kind: "over", days: 30 };
  }
}

export function MemberEditDialog({
  member,
  open,
  onOpenChange,
}: {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const initialBucket = bucketToForm(member.lastSeen);

  const [form, setForm] = React.useState({
    ign: member.ign,
    discordId: member.discordId ?? "",
    guildRank: member.guildRank,
    isGuildmaster: member.isGuildmaster,
    rosterStatus: member.rosterStatus,
    sandstormSquad: member.sandstormSquad,
    power: member.power,
    level: member.level,
    donations: member.donations,
    kills: member.kills,
    timezone: member.timezone,
    notes: member.notes ?? "",
    bucketKind: initialBucket.kind,
    bucketN: initialBucket.n,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    setError(null);
    const patch: MemberPatch = {
      ign: form.ign,
      discordId: form.discordId.trim() || null,
      guildRank: form.guildRank,
      isGuildmaster: form.isGuildmaster,
      rosterStatus: form.rosterStatus,
      sandstormSquad: form.sandstormSquad,
      power: form.power,
      level: form.level,
      donations: form.donations,
      kills: form.kills,
      timezone: form.timezone,
      notes: form.notes || null,
      lastSeenBucket: formToBucket(form.bucketKind, form.bucketN),
    };
    try {
      await updateMember(member.id, patch);
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const needsBucketN =
    form.bucketKind === "minutes" || form.bucketKind === "hours";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader title={`Edit ${member.ign}`} sub="Officer / Admin" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="IGN">
            <Input
              value={form.ign}
              onChange={(e) => set("ign", e.target.value)}
            />
          </Field>
          <Field label="Discord ID">
            <Input
              value={form.discordId}
              onChange={(e) => set("discordId", e.target.value)}
              placeholder="e.g. 1290714264780275827"
              inputMode="numeric"
            />
          </Field>
          <Field label="Rank">
            <select
              className={selectCls}
              value={form.guildRank}
              onChange={(e) =>
                set("guildRank", Number(e.target.value) as Member["guildRank"])
              }
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  R{r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className={selectCls}
              value={form.rosterStatus}
              onChange={(e) =>
                set("rosterStatus", e.target.value as typeof form.rosterStatus)
              }
            >
              <option value="active">Active</option>
              <option value="LOA">LOA</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Squad">
            <select
              className={selectCls}
              value={form.sandstormSquad ?? ""}
              onChange={(e) =>
                set(
                  "sandstormSquad",
                  e.target.value === ""
                    ? null
                    : (e.target.value as "A" | "B"),
                )
              }
            >
              <option value="">—</option>
              <option value="A">Squad A</option>
              <option value="B">Squad B</option>
            </select>
          </Field>
          <Field label="Power">
            <Input
              type="number"
              value={form.power}
              onChange={(e) => set("power", Number(e.target.value))}
            />
          </Field>
          <Field label="Level">
            <Input
              type="number"
              value={form.level}
              onChange={(e) => set("level", Number(e.target.value))}
            />
          </Field>
          <Field label="Donations">
            <Input
              type="number"
              value={form.donations}
              onChange={(e) => set("donations", Number(e.target.value))}
            />
          </Field>
          <Field label="Kills">
            <Input
              type="number"
              value={form.kills}
              onChange={(e) => set("kills", Number(e.target.value))}
            />
          </Field>
          <Field label="Last seen">
            <select
              className={selectCls}
              value={form.bucketKind}
              onChange={(e) =>
                set("bucketKind", e.target.value as BucketKind)
              }
            >
              <option value="online">Online</option>
              <option value="minutes">N min</option>
              <option value="hours">N h</option>
              <option value="days1">1d</option>
              <option value="days2">2d</option>
              <option value="over3">over 3d</option>
              <option value="over7">over 7d</option>
              <option value="over30">over 30d</option>
            </select>
          </Field>
          <Field label={needsBucketN ? "…value" : "Timezone (IANA)"}>
            {needsBucketN ? (
              <Input
                type="number"
                value={form.bucketN}
                onChange={(e) => set("bucketN", Number(e.target.value))}
              />
            ) : (
              <Input
                value={form.timezone}
                onChange={(e) => set("timezone", e.target.value)}
              />
            )}
          </Field>
          <label className="col-span-2 flex items-center gap-2 text-sm text-text-2">
            <input
              type="checkbox"
              checked={form.isGuildmaster}
              onChange={(e) => set("isGuildmaster", e.target.checked)}
            />
            Guildmaster
          </label>
          <div className="col-span-2">
            <Field label="Notes">
              <textarea
                className="min-h-16 w-full rounded-md border border-border-2 bg-surface px-2 py-1.5 text-sm text-text outline-none focus-visible:border-violet/60"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Field>
          </div>
        </div>
        {error ? <p className="mt-3 text-xs text-bad">{error}</p> : null}
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
