"use client";

import Link from "next/link";
import { REGISTRY, CATEGORY_ORDER } from "@/lib/registry";
import { SectionTitle } from "@/components/layout/page-header";

export default function LibraryIndex() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-text">Component Library</h1>
        <p className="text-sm text-text-2">
          The shared vocabulary from{" "}
          <span className="font-mono text-text-3">docs/components.md</span>. Each
          component has a preview page with its states and variants.
        </p>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const items = REGISTRY.filter((e) => e.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category} className="space-y-3">
            <SectionTitle>{category}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/library/${entry.id}`}
                  className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-violet/50"
                >
                  <div className="font-mono text-sm text-text">{entry.name}</div>
                  <p className="mt-1 text-xs text-text-3">{entry.description}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
