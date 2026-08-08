"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Member } from "@/lib/game/types";
import type { Stronghold } from "@/lib/game/stronghold";
import { updateStronghold } from "@/lib/actions/strongholds";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberPicker } from "@/components/domain/member/member-picker";

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

/** ISO → value for <input type=datetime-local> (local time). */
function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function StrongholdEditDialog({
  stronghold: s,
  members,
  open,
  onOpenChange,
}: {
  stronghold: Stronghold;
  members: Member[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const isSanctum = s.category === "sanctum";
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    level: s.level,
    occupier: s.occupier ?? "",
    coordX: s.coordX,
    coordY: s.coordY,
    deathRate: s.deathRate ?? 20,
    guardianId: s.guardianId ?? null,
    governorIds: [s.governorIds?.[0] ?? null, s.governorIds?.[1] ?? null],
    sentryIds: Array.from({ length: 5 }, (_, i) => s.sentryIds?.[i] ?? null),
    opensAt: toLocalInput(s.opensAt),
    closesAt: toLocalInput(s.closesAt),
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setArr = (
    key: "governorIds" | "sentryIds",
    i: number,
    v: string | null,
  ) => setForm((f) => ({ ...f, [key]: f[key].map((x, j) => (j === i ? v : x)) }));

  // Exclude members already holding another role on this building.
  const held = [form.guardianId, ...form.governorIds, ...form.sentryIds].filter(
    Boolean,
  ) as string[];

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await updateStronghold(s.id, {
        level: form.level,
        occupier: form.occupier || null,
        coordX: form.coordX,
        coordY: form.coordY,
        deathRate: isSanctum ? form.deathRate : null,
        ...(isSanctum
          ? {
              guardianId: form.guardianId,
              governorIds: form.governorIds,
              sentryIds: form.sentryIds,
              opensAt: form.opensAt
                ? new Date(form.opensAt).toISOString()
                : null,
              closesAt: form.closesAt
                ? new Date(form.closesAt).toISOString()
                : null,
            }
          : {}),
      });
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          title={`Edit ${s.name ?? "Desert Ruin"}`}
          sub="Officer / Admin"
        />
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Level">
              <Input
                type="number"
                value={form.level}
                onChange={(e) => set("level", Number(e.target.value))}
              />
            </Field>
            <Field label="Coord X">
              <Input
                type="number"
                value={form.coordX}
                onChange={(e) => set("coordX", Number(e.target.value))}
              />
            </Field>
            <Field label="Coord Y">
              <Input
                type="number"
                value={form.coordY}
                onChange={(e) => set("coordY", Number(e.target.value))}
              />
            </Field>
            <Field label="Occupier">
              <Input
                value={form.occupier}
                onChange={(e) => set("occupier", e.target.value)}
              />
            </Field>
            {isSanctum ? (
              <Field label="Death rate %">
                <Input
                  type="number"
                  value={form.deathRate}
                  onChange={(e) => set("deathRate", Number(e.target.value))}
                />
              </Field>
            ) : null}
          </div>

          {isSanctum ? (
            <>
              <Field label="Guardian">
                <MemberPicker
                  members={members}
                  value={form.guardianId}
                  onChange={(v) => set("guardianId", v)}
                  exclude={held.filter((id) => id !== form.guardianId)}
                  placeholder="Assign guardian…"
                />
              </Field>
              {[0, 1].map((i) => (
                <Field key={i} label={`Governor ${i + 1}`}>
                  <MemberPicker
                    members={members}
                    value={form.governorIds[i]}
                    onChange={(v) => setArr("governorIds", i, v)}
                    exclude={held.filter((id) => id !== form.governorIds[i])}
                    placeholder="Assign governor…"
                  />
                </Field>
              ))}
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Field key={i} label={`Sentry ${i + 1}`}>
                    <MemberPicker
                      members={members}
                      value={form.sentryIds[i]}
                      onChange={(v) => setArr("sentryIds", i, v)}
                      exclude={held.filter((id) => id !== form.sentryIds[i])}
                      placeholder="Assign…"
                    />
                  </Field>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Opens at">
                  <Input
                    type="datetime-local"
                    value={form.opensAt}
                    onChange={(e) => set("opensAt", e.target.value)}
                  />
                </Field>
                <Field label="Closes at">
                  <Input
                    type="datetime-local"
                    value={form.closesAt}
                    onChange={(e) => set("closesAt", e.target.value)}
                  />
                </Field>
              </div>
            </>
          ) : null}
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

/** Wraps a StrongholdCard with an Edit button + dialog (Officer/Admin). */
export function EditableStronghold({
  stronghold,
  members,
  children,
}: {
  stronghold: Stronghold;
  members: Member[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      {children}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Edit stronghold"
        className="absolute right-2 top-2 inline-flex items-center rounded-md border border-border-2 bg-surface-2 px-2 py-1 text-xs text-text-3 transition-colors hover:text-violet"
      >
        Edit
      </button>
      {open ? (
        <StrongholdEditDialog
          stronghold={stronghold}
          members={members}
          open={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </div>
  );
}
