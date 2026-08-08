import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-border-2 bg-surface px-3 text-sm text-text placeholder:text-text-3 outline-none transition-colors focus-visible:border-violet/60 focus-visible:ring-2 focus-visible:ring-violet/30 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
