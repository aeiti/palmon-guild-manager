"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEntry } from "@/lib/registry";

export default function ComponentPreview() {
  const params = useParams<{ id: string }>();
  const entry = getEntry(params.id);

  if (!entry) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Link
          href="/library"
          className="inline-flex items-center gap-1 text-sm text-text-2 hover:text-text"
        >
          <ArrowLeft className="size-4" />
          All components
        </Link>
        <p className="text-sm text-text-3">
          No component registered as{" "}
          <span className="font-mono">{params.id}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/library"
        className="inline-flex items-center gap-1 text-sm text-text-2 transition-colors hover:text-text"
      >
        <ArrowLeft className="size-4" />
        All components
      </Link>

      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-3">
          {entry.category}
        </p>
        <h1 className="text-2xl font-semibold text-text">{entry.name}</h1>
        <p className="text-sm text-text-2">{entry.description}</p>
      </div>

      {/* Preview on the true page ground so components read as they will live. */}
      <div className="rounded-lg border border-border bg-void p-8">
        {entry.render()}
      </div>
    </div>
  );
}
