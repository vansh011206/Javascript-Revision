"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CodeEditor } from "./CodeEditor";

const STARTER = `// New snippet — write some JavaScript, then "Save to Vault".
// Try IntelliSense, Ctrl+/ to toggle comments, and bracket matching.

function greet(name) {
  return \`Hello, \${name}! 👋\`;
}

console.log(greet("Vault"));
`;

export function NotebookClient() {
  const router = useRouter();
  const [code, setCode] = useState(STARTER);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openModal = useCallback(() => {
    setError(null);
    setModalOpen(true);
  }, []);

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a topic name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, content: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      // Refresh the dashboard cache, then open the new topic in the editor.
      router.refresh();
      router.push(`/topic/${encodeURIComponent(data.slug)}`);
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <header className="glass z-10 border-b border-vault-border px-5 py-3.5 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight">Notebook</h1>
            <p className="font-mono text-xs text-vault-faint">
              scratch buffer · not yet saved
            </p>
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-teal to-accent-purple px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-[1.03] active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M5 3h11l3 3v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
              <path d="M17 21v-8H7v8M7 3v5h8" />
            </svg>
            Save to Vault
          </button>
        </div>
      </header>

      {/* Editor */}
      <div className="min-h-0 flex-1">
        <CodeEditor value={code} onChange={setCode} onSave={openModal} />
      </div>

      {/* Name modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => !saving && setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-md rounded-2xl border border-vault-border p-6"
            >
              <h2 className="text-lg font-semibold tracking-tight">
                Save to Vault
              </h2>
              <p className="mt-1 text-sm text-vault-muted">
                Give your snippet a name. It becomes a{" "}
                <span className="font-mono text-vault-text">.js</span> file and a
                new card on your dashboard.
              </p>

              <label className="mt-5 block text-xs font-medium text-vault-muted">
                Topic name
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !saving) create();
                }}
                placeholder="e.g. Promises, Map & Set, Closures"
                className="mt-1.5 w-full rounded-xl border border-vault-border bg-black/30 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-vault-faint focus:border-accent-teal/60"
              />
              {name.trim() && (
                <p className="mt-2 font-mono text-xs text-vault-faint">
                  → {name.trim().replace(/\.js$/i, "").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_")}.js
                </p>
              )}
              {error && (
                <p className="mt-2 text-xs text-red-400">{error}</p>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-vault-muted transition-colors hover:bg-white/5 hover:text-vault-text disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={create}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-teal to-accent-purple px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Create file"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
