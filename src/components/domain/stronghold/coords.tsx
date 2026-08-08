import { cn } from "@/lib/utils";

/** Map coordinates (docs/components.md §3.2): `X:485 Y:602`, mono. */
export function Coords({
  x,
  y,
  className,
}: {
  x: number;
  y: number;
  className?: string;
}) {
  return (
    <span className={cn("font-mono text-xs tabular-nums text-text-3", className)}>
      X:{x} Y:{y}
    </span>
  );
}
