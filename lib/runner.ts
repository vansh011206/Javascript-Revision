/**
 * Runs a snippet of JavaScript in a sandboxed Web Worker and collects its
 * console output. Because it executes in the browser's real JS engine, the
 * results match exactly what you'd see in the devtools console / Node — the
 * output is accurate, not a simulation.
 *
 * Safety: the worker has no DOM access, and a wall-clock timeout terminates
 * runaway code (e.g. `while (true) {}`) so the tab never freezes.
 */

export type LogLevel = "log" | "info" | "warn" | "error" | "debug";

export type LogEntry = { level: LogLevel; text: string };

export type RunResult = {
  logs: LogEntry[];
  error: boolean;
  timedOut: boolean;
  durationMs: number;
};

// The worker source. Kept as a string so it can be turned into a Blob URL —
// no separate file / bundler config needed. Written in plain ES5-ish JS so it
// runs verbatim inside the Worker.
const WORKER_SRC = `
self.onmessage = function (e) {
  var code = e.data;

  function stringify(v, seen, depth) {
    if (v === null) return "null";
    var t = typeof v;
    if (t === "undefined") return "undefined";
    if (t === "string") return depth === 0 ? v : JSON.stringify(v);
    if (t === "number" || t === "boolean") return String(v);
    if (t === "bigint") return String(v) + "n";
    if (t === "symbol") return v.toString();
    if (t === "function") {
      return "[Function" + (v.name ? ": " + v.name : " (anonymous)") + "]";
    }
    if (v instanceof Error) return v.name + ": " + v.message;
    if (v instanceof RegExp) return v.toString();
    if (v instanceof Date) return v.toISOString();
    if (seen.indexOf(v) !== -1) return "[Circular]";
    if (depth > 4) return Array.isArray(v) ? "[Array]" : "[Object]";
    seen.push(v);
    var out;
    if (Array.isArray(v)) {
      var items = v.map(function (x) { return stringify(x, seen, depth + 1); });
      out = "[ " + items.join(", ") + " ]";
      if (v.length === 0) out = "[]";
    } else if (typeof Map !== "undefined" && v instanceof Map) {
      var mp = [];
      v.forEach(function (val, key) {
        mp.push(stringify(key, seen, depth + 1) + " => " + stringify(val, seen, depth + 1));
      });
      out = "Map(" + v.size + ") { " + mp.join(", ") + " }";
    } else if (typeof Set !== "undefined" && v instanceof Set) {
      var sp = [];
      v.forEach(function (val) { sp.push(stringify(val, seen, depth + 1)); });
      out = "Set(" + v.size + ") { " + sp.join(", ") + " }";
    } else {
      var keys = Object.keys(v);
      var parts = keys.map(function (k) {
        return k + ": " + stringify(v[k], seen, depth + 1);
      });
      out = parts.length ? "{ " + parts.join(", ") + " }" : "{}";
      var ctor = v.constructor && v.constructor.name;
      if (ctor && ctor !== "Object") out = ctor + " " + out;
    }
    seen.splice(seen.indexOf(v), 1);
    return out;
  }

  function fmt(args) {
    return Array.prototype.slice.call(args).map(function (a) {
      return stringify(a, [], 0);
    }).join(" ");
  }

  function post(level, args) {
    self.postMessage({ kind: "log", level: level, text: fmt(args) });
  }

  var sandboxConsole = {
    log: function () { post("log", arguments); },
    info: function () { post("info", arguments); },
    warn: function () { post("warn", arguments); },
    error: function () { post("error", arguments); },
    debug: function () { post("debug", arguments); },
    table: function () { post("log", arguments); },
    dir: function () { post("log", arguments); },
    trace: function () { post("log", arguments); },
    assert: function () {
      var a = Array.prototype.slice.call(arguments);
      if (!a[0]) post("error", ["Assertion failed:"].concat(a.slice(1)));
    },
  };

  // Surface errors thrown from async callbacks (setTimeout, promises).
  self.onerror = function (msg) {
    self.postMessage({ kind: "log", level: "error", text: "Uncaught " + msg });
    return true;
  };
  self.onunhandledrejection = function (ev) {
    var r = ev && ev.reason;
    var text = r instanceof Error ? r.name + ": " + r.message : String(r);
    self.postMessage({ kind: "log", level: "error", text: "Uncaught (in promise) " + text });
  };

  try {
    var fn = new Function("console", code);
    fn(sandboxConsole);
    // Defer "done" by a macrotask so promise .then() and setTimeout(0) logs
    // flush first — closer to how you'd actually see output.
    setTimeout(function () { self.postMessage({ kind: "done", error: false }); }, 0);
  } catch (err) {
    var text = err instanceof Error ? err.name + ": " + err.message : String(err);
    self.postMessage({ kind: "log", level: "error", text: text });
    self.postMessage({ kind: "done", error: true });
  }
};
`;

/** Execute `code` and resolve with everything it logged. Never rejects. */
export function runJavaScript(
  code: string,
  { timeoutMs = 4000 }: { timeoutMs?: number } = {},
): Promise<RunResult> {
  return new Promise((resolve) => {
    const logs: LogEntry[] = [];
    const start =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    let settled = false;
    let worker: Worker | null = null;
    let url = "";

    const finish = (opts: { error: boolean; timedOut?: boolean }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        worker?.terminate();
      } catch {
        /* ignore */
      }
      if (url) URL.revokeObjectURL(url);
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      resolve({
        logs,
        error: opts.error,
        timedOut: !!opts.timedOut,
        durationMs: Math.max(0, Math.round(now - start)),
      });
    };

    const timer = setTimeout(() => {
      logs.push({
        level: "error",
        text: `⏱ Timed out after ${timeoutMs} ms — possible infinite loop.`,
      });
      finish({ error: true, timedOut: true });
    }, timeoutMs);

    try {
      url = URL.createObjectURL(
        new Blob([WORKER_SRC], { type: "application/javascript" }),
      );
      worker = new Worker(url);
    } catch {
      logs.push({ level: "error", text: "Runner unavailable in this browser." });
      finish({ error: true });
      return;
    }

    worker.onmessage = (e: MessageEvent) => {
      const d = e.data as
        | { kind: "log"; level: LogLevel; text: string }
        | { kind: "done"; error: boolean };
      if (d.kind === "log") logs.push({ level: d.level, text: d.text });
      else if (d.kind === "done") finish({ error: d.error });
    };
    worker.onerror = (e) => {
      logs.push({ level: "error", text: e.message || "Worker error" });
      finish({ error: true });
    };

    worker.postMessage(code);
  });
}
