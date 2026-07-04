"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Topic } from "@/lib/topics";
import {
  accentClasses,
  accentFor,
  difficultyChip,
  relativeTime,
} from "@/lib/ui";

export function TopicCard({ topic, index }: { topic: Topic; index: number }) {
  const accent = accentClasses[accentFor(topic.slug)];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link href={`/topic/${encodeURIComponent(topic.slug)}`}>
        <motion.article
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className={`glass group relative flex h-full flex-col rounded-2xl border border-vault-border p-5 transition-all duration-300 ${accent.ring} ${accent.glow}`}
        >
          {/* Header row: file glyph + difficulty */}
          <div className="mb-4 flex items-start justify-between">
            <span
              className={`grid h-11 w-11 place-items-center rounded-xl border border-white/5 bg-white/[0.03] font-mono text-sm font-semibold ${accent.text}`}
            >
              {"{ }"}
            </span>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${difficultyChip[topic.difficulty]}`}
            >
              {topic.difficulty}
            </span>
          </div>

          <h3 className="text-[15px] font-semibold tracking-tight text-vault-text">
            {topic.title}
          </h3>
          <p className="mt-1 font-mono text-xs text-vault-faint">
            {topic.fileName}
          </p>

          {/* Footer meta */}
          <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-vault-muted">
            <span className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
              {topic.lines} lines
            </span>
            <span>{relativeTime(topic.modified)}</span>
          </div>

          {/* Hover arrow */}
          <span className="pointer-events-none absolute right-5 top-5 translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 ${accent.text}`}
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </motion.article>
      </Link>
    </motion.div>
  );
}
