"use client";

import { marked } from "marked";
import { useMemo } from "react";

type MarkdownPanelProps = {
  markdown: string;
};

export function MarkdownPanel({ markdown }: MarkdownPanelProps) {
  const html = useMemo(() => marked(markdown) as string, [markdown]);

  return (
    <div
      className="prose prose-zinc max-w-none prose-headings:font-medium prose-headings:text-zinc-950 prose-p:text-zinc-700 prose-a:text-zinc-900 prose-strong:text-zinc-950 prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5 prose-pre:rounded-xl prose-pre:bg-zinc-950 prose-pre:text-zinc-50 dark:prose-invert dark:prose-headings:text-zinc-100 dark:prose-p:text-zinc-300 dark:prose-a:text-zinc-100 dark:prose-strong:text-zinc-100 dark:prose-code:bg-zinc-800 dark:prose-pre:bg-zinc-950"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
