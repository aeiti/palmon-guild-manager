"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  /** Provide to make the column sortable. */
  sortValue?: (row: T) => string | number;
  headerClassName?: string;
  cellClassName?: string;
}

type SortState = { key: string; dir: "asc" | "desc" };

function alignClass(align: Column<unknown>["align"]) {
  return align === "right"
    ? "text-right"
    : align === "center"
      ? "text-center"
      : "text-left";
}

/**
 * Sortable table (docs/components.md §3.5): sticky header, horizontal scroll,
 * tabular numerics, row hover. Client-side sort at ~50–100 rows; no TanStack.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  initialSort,
  onRowClick,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  initialSort?: SortState;
  onRowClick?: (row: T) => void;
  className?: string;
}) {
  const [sort, setSort] = React.useState<SortState | null>(initialSort ?? null);

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });
  }, [rows, sort, columns]);

  function toggleSort(col: Column<T>) {
    if (!col.sortValue) return;
    setSort((prev) =>
      prev?.key === col.key
        ? { key: col.key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key: col.key, dir: "asc" },
    );
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-border",
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-surface-2">
          <tr>
            {columns.map((col) => {
              const active = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col)}
                  className={cn(
                    "whitespace-nowrap border-b border-border px-3 py-2 font-mono text-xs uppercase tracking-wide text-text-3",
                    alignClass(col.align),
                    col.sortValue && "cursor-pointer select-none hover:text-text",
                    col.headerClassName,
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center gap-1",
                      col.align === "right" && "flex-row-reverse",
                    )}
                  >
                    {col.header}
                    {col.sortValue ? (
                      active ? (
                        sort.dir === "asc" ? (
                          <ChevronUp className="size-3" />
                        ) : (
                          <ChevronDown className="size-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3 opacity-40" />
                      )
                    ) : null}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={getRowId(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-b border-border/60 transition-colors last:border-0 hover:bg-surface-2/50",
                onRowClick && "cursor-pointer",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-3 py-2 text-text-2",
                    alignClass(col.align),
                    col.cellClassName,
                  )}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
