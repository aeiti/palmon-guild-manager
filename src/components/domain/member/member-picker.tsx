"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/game/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MemberChip } from "./member-chip";

/**
 * Combobox over the roster (docs/components.md §3.1). `exclude` drops members
 * already holding a role on the same building so nobody is double-assigned.
 */
export function MemberPicker({
  members,
  value,
  onChange,
  exclude = [],
  filter,
  placeholder = "Assign member…",
  className,
}: {
  members: Member[];
  value: string | null;
  onChange: (id: string | null) => void;
  exclude?: string[];
  filter?: (m: Member) => boolean;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const options = React.useMemo(() => {
    const excluded = new Set(exclude);
    return members
      .filter((m) => !excluded.has(m.id) && (filter ? filter(m) : true))
      .sort((a, b) => a.ign.localeCompare(b.ign));
  }, [members, exclude, filter]);

  const selected = members.find((m) => m.id === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border-2 bg-surface px-3 text-sm outline-none transition-colors hover:border-violet/50 focus-visible:ring-2 focus-visible:ring-violet/30",
            className,
          )}
        >
          {selected ? (
            <MemberChip member={selected} size="sm" />
          ) : (
            <span className="text-text-3">{placeholder}</span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 text-text-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-64">
        <Command>
          <CommandInput placeholder="Search members…" />
          <CommandList>
            <CommandEmpty>No members found.</CommandEmpty>
            {selected ? (
              <CommandItem
                value="__clear__"
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="text-text-3"
              >
                Clear selection
              </CommandItem>
            ) : null}
            {options.map((m) => (
              <CommandItem
                key={m.id}
                value={m.ign}
                onSelect={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
              >
                <MemberChip member={m} size="sm" />
                {m.id === value ? (
                  <Check className="ml-auto size-4 text-violet" />
                ) : null}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
