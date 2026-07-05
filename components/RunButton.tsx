"use client";

/** The green "Run" action used in the notebook and topic editor toolbars. */
export function RunButton({
  onClick,
  running,
  disabled,
}: {
  onClick: () => void;
  running: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || running}
      title="Run code (Ctrl/Cmd+Enter)"
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
        disabled
          ? "cursor-not-allowed bg-white/5 text-vault-faint"
          : "bg-accent-teal/15 text-accent-teal ring-1 ring-inset ring-accent-teal/30 hover:bg-accent-teal/25 active:scale-95"
      }`}
    >
      {running ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          className="h-4 w-4 animate-spin"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
      {running ? "Running…" : "Run"}
    </button>
  );
}
