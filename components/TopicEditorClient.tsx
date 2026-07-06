"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Topic } from "@/lib/topics";
import { CodeEditor } from "./CodeEditor";
import { RunButton } from "./RunButton";
import { RunConsolePanel, useJsRunner } from "./RunConsole";
import { accentClasses, accentFor, difficultyChip } from "@/lib/ui";

type Status = "saved" | "dirty" | "saving" | "error";

export function TopicEditorClient({
  topic,
  initialContent,
  isLocalFallback = false,
}: {
  topic: Topic;
  initialContent: string;
  isLocalFallback?: boolean;
}) {
  const router = useRouter();
  const accent = accentClasses[accentFor(topic.slug)];

  const [code, setCode] = useState(initialContent);
  const [savedCode, setSavedCode] = useState(initialContent);
  const [status, setStatus] = useState<Status>("saved");
  const [message, setMessage] = useState<string | null>(null);

  const runner = useJsRunner();

  const dirty = code !== savedCode;

  // Load content from localStorage if we are in local fallback mode
  useEffect(() => {
    if (isLocalFallback) {
      try {
        const stored = localStorage.getItem("vault_snippets");
        if (stored) {
          const list = JSON.parse(stored) as { topic: Topic; content: string }[];
          const found = list.find((item) => item.topic.slug === topic.slug);
          if (found) {
            setCode(found.content);
            setSavedCode(found.content);
          }
        }
      } catch (e) {
        console.error("Failed to load local storage snippet:", e);
      }
    }
  }, [isLocalFallback, topic.slug]);

  const saveToLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem("vault_snippets");
      let list = stored ? JSON.parse(stored) : [];
      const index = list.findIndex((item: any) => item.topic.slug === topic.slug);

      const lines = code.split("\n").length;
      const updatedTopic = {
        ...topic,
        lines,
        size: code.length,
        modified: new Date().toISOString(),
      };

      if (index !== -1) {
        list[index] = { topic: updatedTopic, content: code };
      } else {
        list.push({ topic: updatedTopic, content: code });
      }

      localStorage.setItem("vault_snippets", JSON.stringify(list));
      setSavedCode(code);
      setStatus("saved");
      alert("Note: Saved to browser storage (localStorage) because the cloud server filesystem is read-only.");
      router.refresh();
    } catch (e: any) {
      setStatus("error");
      setMessage(e.message ?? "Failed to save to browser storage");
    }
  }, [code, topic, router]);

  const save = useCallback(async () => {
    setStatus("saving");
    setMessage(null);

    if (isLocalFallback) {
      saveToLocalStorage();
      return;
    }

    try {
      const res = await fetch(
        `/api/topics/${encodeURIComponent(topic.slug)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: code }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save");
      }
      setSavedCode(code);
      setStatus("saved");
      router.refresh(); // update card metadata (lines, modified) on the dashboard
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      const isReadOnly = msg.includes("EROFS") || msg.includes("read-only");
      
      if (isReadOnly) {
        saveToLocalStorage();
        return;
      }
      
      setStatus("error");
      setMessage(msg);
    }
  }, [code, topic.slug, router, isLocalFallback, saveToLocalStorage]);

  // Keep status in sync as the user types.
  useEffect(() => {
    if (status === "saving") return;
    setStatus(dirty ? "dirty" : "saved");
  }, [dirty, status]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const deleteFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem("vault_snippets");
      if (stored) {
        let list = JSON.parse(stored);
        list = list.filter((item: any) => item.topic.slug !== topic.slug);
        localStorage.setItem("vault_snippets", JSON.stringify(list));
      }
      router.push("/");
      router.refresh();
    } catch (e) {
      setStatus("error");
      setMessage("Failed to delete from browser storage");
    }
  }, [topic.slug, router]);

  const handleDelete = async () => {
    if (!confirm(`Delete "${topic.title}" from your vault? This cannot be undone.`))
      return;

    if (isLocalFallback) {
      deleteFromLocalStorage();
      return;
    }

    try {
      const res = await fetch(`/api/topics/${encodeURIComponent(topic.slug)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        throw new Error("Failed to delete");
      }
    } catch {
      deleteFromLocalStorage();
    }
  };

  const statusLabel: Record<Status, string> = {
    saved: "All changes saved",
    dirty: "Unsaved changes",
    saving: "Saving…",
    error: message ?? "Error",
  };
  const statusColor: Record<Status, string> = {
    saved: "text-vault-faint",
    dirty: "text-accent-orange",
    saving: "text-accent-teal",
    error: "text-red-400",
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Toolbar */}
      <header className="glass z-10 border-b border-vault-border px-3 py-2 sm:px-8 sm:py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="rounded-lg p-1.5 text-vault-muted transition-colors hover:bg-white/5 hover:text-vault-text"
              aria-label="Back to dashboard"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[15px] font-semibold tracking-tight">
                  {topic.title}
                </h1>
                <span
                  className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-medium sm:inline ${difficultyChip[topic.difficulty]}`}
                >
                  {topic.difficulty}
                </span>
              </div>
              <p className="truncate font-mono text-xs text-vault-faint">
                {topic.fileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`hidden text-xs sm:block ${statusColor[status]}`}>
              {statusLabel[status]}
            </span>
            <RunButton
              onClick={() => runner.run(code)}
              running={runner.running}
            />
            <button
              onClick={handleDelete}
              className="rounded-lg p-2 text-vault-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
              aria-label="Delete topic"
              title="Delete topic"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[18px] w-[18px]"
              >
                <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7" />
              </svg>
            </button>
            <button
              onClick={save}
              disabled={!dirty || status === "saving"}
              className={`inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 sm:px-4 sm:py-2 text-sm font-semibold transition-all ${
                dirty && status !== "saving"
                  ? "bg-gradient-to-r from-accent-orange to-accent-purple text-black hover:scale-[1.03] active:scale-95"
                  : "cursor-not-allowed bg-white/5 text-vault-faint"
              }`}
            >
              {status === "saving" ? "Saving…" : "Save"}
              <kbd className="hidden rounded bg-black/20 px-1.5 py-0.5 font-mono text-[10px] sm:inline">
                ⌘S
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Editor + output console */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="relative min-h-0 flex-1">
          <div
            className={`absolute inset-x-0 top-0 z-10 h-0.5 ${accent.dot} opacity-60`}
          />
          <CodeEditor
            value={code}
            onChange={setCode}
            onSave={save}
            onRun={() => runner.run(code)}
          />
        </div>
        <RunConsolePanel
          open={runner.open}
          logs={runner.logs}
          running={runner.running}
          meta={runner.meta}
          onClose={runner.close}
          onClear={runner.clear}
        />
      </div>
    </div>
  );
}
