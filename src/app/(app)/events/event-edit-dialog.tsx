"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import type { Member } from "@/lib/game/types";
import { EVENT_METRIC, type GuildEvent } from "@/lib/game/event";
import type { ContributionEntry } from "@/lib/game/event";
import { setContributions, updateEvent } from "@/lib/actions/events";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberPicker } from "@/components/domain/member/member-picker";

const selectCls =
  "h-10 w-full rounded-md border border-border-2 bg-surface px-2 text-sm text-text outline-none focus-visible:border-violet/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[0.65rem] uppercase tracking-wide text-text-3">
        {label}
      </span>
      {children}
    </label>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventEditDialog({
  event,
  members,
  contributions,
  open,
  onOpenChange,
}: {
  event: GuildEvent;
  members: Member[];
  contributions: ContributionEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const metric = EVENT_METRIC[event.type];
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fieldEntries = Object.entries(event.fields) as [string, unknown][];
  const fieldTypes = React.useRef(
    Object.fromEntries(fieldEntries.map(([k, v]) => [k, typeof v])),
  ).current;

  const [common, setCommon] = React.useState({
    title: event.title,
    status: event.status,
    opponent: event.opponent ?? "",
    startsAt: toLocalInput(event.startsAt),
  });
  const [fields, setFields] = React.useState<Record<string, string>>(
    Object.fromEntries(fieldEntries.map(([k, v]) => [k, String(v ?? "")])),
  );
  const [rows, setRows] = React.useState(
    contributions.map((c) => ({ memberId: c.memberId, value: c.value })),
  );

  async function save() {
    setSaving(true);
    setError(null);
    const typeFields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      typeFields[k] = fieldTypes[k] === "number" ? Number(v) : v;
    }
    try {
      await updateEvent(event.id, {
        title: common.title,
        status: common.status,
        opponent: common.opponent || null,
        startsAt: new Date(common.startsAt).toISOString(),
        typeFields,
      });
      if (metric) {
        await setContributions(
          event.id,
          metric,
          rows.filter((r) => r.memberId),
        );
      }
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
        <DialogHeader title={`Edit ${event.title}`} sub="Officer / Admin" />
        <div className="space-y-3">
          <Field label="Title">
            <Input
              value={common.title}
              onChange={(e) =>
                setCommon((c) => ({ ...c, title: e.target.value }))
              }
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select
                className={selectCls}
                value={common.status}
                onChange={(e) =>
                  setCommon((c) => ({
                    ...c,
                    status: e.target.value as GuildEvent["status"],
                  }))
                }
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="settled">Settled</option>
              </select>
            </Field>
            <Field label="Opponent">
              <Input
                value={common.opponent}
                onChange={(e) =>
                  setCommon((c) => ({ ...c, opponent: e.target.value }))
                }
              />
            </Field>
            <Field label="Starts at (server)">
              <Input
                type="datetime-local"
                value={common.startsAt}
                onChange={(e) =>
                  setCommon((c) => ({ ...c, startsAt: e.target.value }))
                }
              />
            </Field>
          </div>

          {fieldEntries.length > 0 ? (
            <div className="space-y-2 rounded-md border border-border p-2">
              <p className="font-mono text-[0.6rem] uppercase tracking-wide text-text-3">
                Event fields
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(fields).map((k) => (
                  <Field key={k} label={k}>
                    <Input
                      value={fields[k]}
                      onChange={(e) =>
                        setFields((f) => ({ ...f, [k]: e.target.value }))
                      }
                    />
                  </Field>
                ))}
              </div>
            </div>
          ) : null}

          {metric ? (
            <div className="space-y-2 rounded-md border border-border p-2">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[0.6rem] uppercase tracking-wide text-text-3">
                  Contributions ({metric})
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setRows((r) => [...r, { memberId: "", value: 0 }])
                  }
                  className="inline-flex items-center gap-1 text-xs text-violet hover:underline"
                >
                  <Plus className="size-3" />
                  Add
                </button>
              </div>
              {rows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1">
                    <MemberPicker
                      members={members}
                      value={row.memberId || null}
                      onChange={(v) =>
                        setRows((r) =>
                          r.map((x, j) =>
                            j === i ? { ...x, memberId: v ?? "" } : x,
                          ),
                        )
                      }
                      exclude={rows
                        .filter((_, j) => j !== i)
                        .map((x) => x.memberId)
                        .filter(Boolean)}
                    />
                  </div>
                  <Input
                    type="number"
                    className="w-32"
                    value={row.value}
                    onChange={(e) =>
                      setRows((r) =>
                        r.map((x, j) =>
                          j === i
                            ? { ...x, value: Number(e.target.value) }
                            : x,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRows((r) => r.filter((_, j) => j !== i))
                    }
                    aria-label="Remove"
                    className="text-text-3 hover:text-bad"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
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

export function EditableEvent({
  event,
  members,
  contributions,
  children,
}: {
  event: GuildEvent;
  members: Member[];
  contributions: ContributionEntry[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      {children}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Edit event"
        className="absolute right-2 top-2 inline-flex items-center rounded-md border border-border-2 bg-surface-2 px-2 py-1 text-xs text-text-3 transition-colors hover:text-violet"
      >
        Edit
      </button>
      {open ? (
        <EventEditDialog
          event={event}
          members={members}
          contributions={contributions}
          open={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </div>
  );
}
