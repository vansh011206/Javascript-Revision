"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Topic } from "@/lib/topics";
import { TopicCard } from "./TopicCard";

export function DashboardClient({ initialTopics }: { initialTopics: Topic[] }) {
  const [query, setQuery] = useState("");
  // Track deletions locally so a removed card disappears instantly, before the
  // server refresh lands.
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [localTopics, setLocalTopics] = useState<Topic[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vault_snippets");
      if (stored) {
        const parsed = JSON.parse(stored) as { topic: Topic; content: string }[];
        setLocalTopics(parsed.map((p) => p.topic));
      }
    } catch (e) {
      console.error("Failed to load local storage topics:", e);
    }
  }, []);

  const topics = useMemo(() => {
    const apiTopics = initialTopics.filter((t) => !removed.has(t.slug));
    const merged = [...apiTopics];
    localTopics.forEach((lt) => {
      if (!merged.some((t) => t.slug === lt.slug) && !removed.has(lt.slug)) {
        merged.push(lt);
      }
    });
    return merged.sort((a, b) => b.modified.localeCompare(a.modified));
  }, [initialTopics, localTopics, removed]);

  const handleDeleted = (slug: string) =>
    setRemoved((prev) => new Set(prev).add(slug));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.fileName.toLowerCase().includes(q) ||
        t.difficulty.toLowerCase().includes(q),
    );
  }, [topics, query]);

  const totalLines = topics.reduce((sum, t) => sum + t.lines, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-accent-orange">
              Your JavaScript journey
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Practice Vault
            </h1>
            <p className="mt-2 max-w-xl text-sm text-vault-muted">
              {topics.length} topics · {totalLines} lines of code you&apos;ve
              written. Pick one to review, edit, and run it back.
            </p>
          </div>
          <Link
            href="/notebook"
            className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-accent-orange to-accent-purple px-4 py-2.5 text-sm font-semibold text-black shadow-lg transition-transform hover:scale-[1.03] active:scale-95 sm:self-auto"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              className="h-4 w-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Snippet
          </Link>
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-vault-faint"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics by name, file, or difficulty…"
            className="glass w-full rounded-xl border border-vault-border py-3 pl-11 pr-4 text-sm text-vault-text outline-none transition-colors placeholder:text-vault-faint focus:border-accent-purple/50"
          />
        </div>
      </header>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass mt-4 rounded-2xl border border-vault-border py-20 text-center">
          <p className="text-sm text-vault-muted">
            No topics match{" "}
            <span className="font-mono text-vault-text">
              &ldquo;{query}&rdquo;
            </span>
            .
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((topic, i) => (
              <TopicCard
                key={topic.slug}
                topic={topic}
                index={i}
                onDeleted={handleDeleted}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
