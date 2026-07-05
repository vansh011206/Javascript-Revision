"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CodeEditor } from "./CodeEditor";

const starterFor = (name: string) => `// ${name || "New snippet"}
// Write some JavaScript, then "Save to Vault".
// Try IntelliSense, Ctrl+/ to toggle comments, and bracket matching.

function greet(who) {
  return \`Hello, \${who}! 👋\`;
}

console.log(greet("Vault"));
`;

const previewFile = (name: string) =>
  name
    .trim()
    .replace(/\.js$/i, "")
    .replace(/[^\w\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "_");

export function NotebookClient() {
  const router = useRouter();

  // The name is chosen up front — before you start writing. Until it's set,
  // the naming modal is shown over the (empty) editor.
  const [name, setName] = useState("");
  const [draftName, setDraftName] = useState("");
  const [nameSet, setNameSet] = useState(false);

  const [code, setCode] = useState(starterFor(""));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Step 1 — lock in the name, then reveal the editor.
  const confirmName = () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setError("Please enter a name for this snippet.");
      return;
    }
    if (!previewFile(trimmed)) {
      setError("Use letters, numbers, spaces, - or _.");
      return;
    }
    setName(trimmed);
    setCode(starterFor(trimmed));
    setError(null);
    setNameSet(true);
  };

  // Step 2 — save the named snippet, then return to the dashboard so it
  // appears as a card alongside every other topic.
  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      router.push("/");
      router.refresh();
    } catch (err) {
      setSaving(false);
      const msg = err instanceof Error ? err.message : "Failed to save";
      setError(msg);
      // A name clash means they need to pick a different one — reopen naming.
      if (/exists/i.test(msg)) {
        setDraftName(name);
        setNameSet(false);
      }
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <header className="glass z-10 border-b border-vault-border px-5 py-3.5 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[15px] font-semibold tracking-tight">
                {nameSet ? name : "Notebook"}
              </h1>
              {nameSet && (
                <button
                  onClick={() => {
                    setDraftName(name);
                    setNameSet(false);
                    setError(null);
                  }}
                  className="rounded-md p-1 text-vault-faint transition-colors hover:bg-white/5 hover:text-vault-text"
                  title="Rename"
                  aria-label="Rename snippet"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
              )}
            </div>
            <p className="truncate font-mono text-xs text-vault-faint">
              {nameSet ? `${previewFile(name)}.js · not yet saved` : "name your snippet to begin"}
            </p>
          </div>
          <button
            onClick={save}
            disabled={!nameSet || saving}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              nameSet && !saving
                ? "bg-gradient-to-r from-accent-teal to-accent-purple text-black hover:scale-[1.03] active:scale-95"
                : "cursor-not-allowed bg-white/5 text-vault-faint"
            }`}
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
            {saving ? "Saving…" : "Save to Vault"}
          </button>
        </div>
        {error && nameSet && (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        )}
      </header>

      {/* Editor */}
      <div className="min-h-0 flex-1">
        <CodeEditor value={code} onChange={setCode} onSave={save} />
      </div>

      {/* Naming modal — shown first, before any code is written */}
      <AnimatePresence>
        {!nameSet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="glass w-full max-w-md rounded-2xl border border-vault-border p-6"
            >
              <h2 className="text-lg font-semibold tracking-tight">
                Name your snippet
              </h2>
              <p className="mt-1 text-sm text-vault-muted">
                Choose a name before you start. It becomes a{" "}
                <span className="font-mono text-vault-text">.js</span> file and a
                new card on your dashboard.
              </p>

              <label className="mt-5 block text-xs font-medium text-vault-muted">
                Topic name
              </label>
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmName();
                }}
                placeholder="e.g. Promises, Map & Set, Closures"
                className="mt-1.5 w-full rounded-xl border border-vault-border bg-black/30 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-vault-faint focus:border-accent-teal/60"
              />
              {draftName.trim() && previewFile(draftName) && (
                <p className="mt-2 font-mono text-xs text-vault-faint">
                  → {previewFile(draftName)}.js
                </p>
              )}
              {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => router.push("/")}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-vault-muted transition-colors hover:bg-white/5 hover:text-vault-text"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmName}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-teal to-accent-purple px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-[1.03] active:scale-95"
                >
                  Start coding
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
