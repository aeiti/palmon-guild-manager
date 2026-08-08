import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Base pill. Domain badges (RankBadge, StatusPill, …) compose this with a tone.
// Tones follow the colour rules (§1.1): violet = interactive/brand, desert =
// economy, good/warn/bad = state. `neutral`/`outline` are non-semantic chrome.
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border font-mono text-xs uppercase tracking-wide whitespace-nowrap tabular-nums",
  {
    variants: {
      tone: {
        neutral: "border-border-2 bg-surface-2 text-text-2",
        outline: "border-border-2 bg-transparent text-text-2",
        violet: "border-violet/30 bg-violet/10 text-violet",
        desert: "border-desert/30 bg-desert/10 text-desert",
        good: "border-good/30 bg-good/10 text-good",
        warn: "border-warn/30 bg-warn/10 text-warn",
        bad: "border-bad/30 bg-bad/10 text-bad",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[0.65rem]",
        md: "px-2 py-0.5 text-xs",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size, className }))} {...props} />
  );
}

export { badgeVariants };
