"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Topic } from "@/lib/topics";
import {
  accentClasses,
  accentFor,
  difficultyChip,
  relativeTime,
} from "@/lib/ui";

export function TopicCard({
  topic,
  index,
  onDeleted,
}: {
  topic: Topic;
  index: number;
  onDeleted: (slug: string) => void;
}) {
  const router = useRouter();
  const accent = accentClasses[accentFor(topic.slug)];
  const [deleting, setDeleting] = useState(false);

  const open = () => router.push(`/topic/${encodeURIComponent(topic.slug)}`);

  const edit = (e: React.MouseEvent) => {
    e.stopPropagation();
    open();
  };

  const deleteFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem("vault_snippets");
      if (stored) {
        let list = JSON.parse(stored);
        list = list.filter((item: any) => item.topic.slug !== topic.slug);
        localStorage.setItem("vault_snippets", JSON.stringify(list));
      }
      onDeleted(topic.slug);
      router.refresh();
    } catch (e) {
      alert("Failed to delete from browser storage");
    }
  };

  const remove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !confirm(`Delete "${topic.title}" from your vault? This cannot be undone.`)
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/topics/${encodeURIComponent(topic.slug)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error();
      onDeleted(topic.slug);
      router.refresh();
    } catch {
      // Fallback: Delete from browser local storage if the server API fails (e.g. read-only file system)
      deleteFromLocalStorage();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
    >
      <motion.article
        onClick={open}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className={`glass group relative flex h-full cursor-pointer flex-col rounded-2xl border border-vault-border p-6 transition-all duration-300 ${accent.ring} ${accent.glow} ${
          deleting ? "pointer-events-none opacity-40" : ""
        }`}
      >
        {/* Header row: file glyph + difficulty */}
        <div className="mb-5 flex items-start justify-between">
          <span
            className={`grid h-12 w-12 place-items-center rounded-xl border border-white/5 bg-white/[0.03] font-mono text-sm font-semibold ${accent.text}`}
          >
            {"{ }"}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${difficultyChip[topic.difficulty]}`}
          >
            {topic.difficulty}
          </span>
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-vault-text">
          {topic.title}
        </h3>
        <p className="mt-1 font-mono text-xs text-vault-faint">
          {topic.fileName}
        </p>

        {/* Footer meta + actions */}
        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-vault-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
              {topic.lines} lines
            </span>
            <span className="text-vault-faint">{relativeTime(topic.modified)}</span>
          </div>

          {/* Edit + Delete — visible on hover, always visible on touch */}
          <div className="flex items-center gap-1 sm:opacity-60 transition-opacity duration-200 group-hover:opacity-100 opacity-100">
            <button
              onClick={edit}
              aria-label="Edit snippet"
              title="Edit"
              className="rounded-lg p-1.5 text-vault-muted transition-colors hover:bg-white/8 hover:text-vault-text"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[17px] w-[17px]"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
            <button
              onClick={remove}
              aria-label="Delete snippet"
              title="Delete"
              className="rounded-lg p-1.5 text-vault-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[17px] w-[17px]"
              >
                <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7" />
              </svg>
            </button>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
