"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { runJavaScript, type LogEntry, type RunResult } from "@/lib/runner";

type Meta = Pick<RunResult, "error" | "timedOut" | "durationMs">;

/** Runs JS off the main thread and tracks output/status for the UI. */
export function useJsRunner() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [open, setOpen] = useState(false);
  // Guard against overlapping runs (double-click / Ctrl+Enter spam).
  const busy = useRef(false);

  const run = useCallback(async (code: string) => {
    if (busy.current) return;
    busy.current = true;
    setOpen(true);
    setRunning(true);
    setLogs([]);
    setMeta(null);
    const res = await runJavaScript(code);
    setLogs(res.logs);
    setMeta({
      error: res.error,
      timedOut: res.timedOut,
      durationMs: res.durationMs,
    });
    setRunning(false);
    busy.current = false;
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const clear = useCallback(() => {
    setLogs([]);
    setMeta(null);
  }, []);

  return { logs, running, meta, open, run, close, clear };
}

const levelStyle: Record<LogEntry["level"], string> = {
  log: "text-vault-text",
  info: "text-accent-teal",
  debug: "text-vault-muted",
  warn: "text-accent-orange",
  error: "text-red-400",
};

const levelGlyph: Record<LogEntry["level"], string> = {
  log: "›",
  info: "ℹ",
  debug: "•",
  warn: "▲",
  error: "✕",
};

export function RunConsole({
  logs,
  running,
  meta,
  onClose,
  onClear,
}: {
  logs: LogEntry[];
  running: boolean;
  meta: Meta | null;
  onClose: () => void;
  onClear: () => void;
}) {
  const statusText = running
    ? "Running…"
    : meta
      ? meta.timedOut
        ? "Timed out"
        : meta.error
          ? "Finished with errors"
          : "Ran successfully"
      : "";

  const statusColor = running
    ? "text-accent-teal"
    : meta?.timedOut || meta?.error
      ? "text-red-400"
      : "text-accent-teal";

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "40%", opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="glass flex min-h-0 flex-col border-t border-vault-border"
    >
      {/* Console header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-vault-text">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-accent-teal"
            >
              <path d="m8 9 3 3-3 3M13 15h3" />
              <rect x="3" y="4" width="18" height="16" rx="2" />
            </svg>
            Output
          </span>
          {statusText && (
            <span className={`flex items-center gap-1.5 text-[11px] ${statusColor}`}>
              {running && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-teal" />
              )}
              {statusText}
              {meta && !running && (
                <span className="text-vault-faint">· {meta.durationMs} ms</span>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            className="rounded-md px-2 py-1 text-[11px] font-medium text-vault-muted transition-colors hover:bg-white/5 hover:text-vault-text"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            aria-label="Close output"
            className="rounded-md p-1 text-vault-faint transition-colors hover:bg-white/5 hover:text-vault-text"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Log stream */}
      <div className="min-h-0 flex-1 overflow-auto px-4 py-3 font-mono text-[13px] leading-relaxed">
        {logs.length === 0 && !running && (
          <p className="text-vault-faint">
            No output. Use{" "}
            <span className="text-vault-muted">console.log(...)</span> to print
            something.
          </p>
        )}
        {logs.length === 0 && running && (
          <p className="text-vault-faint">Executing your code…</p>
        )}
        {logs.map((entry, i) => (
          <div
            key={i}
            className={`flex gap-2 whitespace-pre-wrap break-words border-b border-white/[0.03] py-0.5 ${levelStyle[entry.level]}`}
          >
            <span className="select-none opacity-40">{levelGlyph[entry.level]}</span>
            <span className="flex-1">{entry.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Convenience wrapper: renders the console only when `open`, with enter/exit
 * animation. Callers own the state via {@link useJsRunner}.
 */
export function RunConsolePanel({
  open,
  logs,
  running,
  meta,
  onClose,
  onClear,
}: {
  open: boolean;
  logs: LogEntry[];
  running: boolean;
  meta: Meta | null;
  onClose: () => void;
  onClear: () => void;
}) {
  if (!open) return null;
  return (
    <RunConsole
      logs={logs}
      running={running}
      meta={meta}
      onClose={onClose}
      onClear={onClear}
    />
  );
}
