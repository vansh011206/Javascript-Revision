import fs from "fs/promises";
import path from "path";

/**
 * All practice files live in /data at the project root. This is the single
 * source of truth the app reads from and writes to, so your progress is
 * persisted to real files on disk (not just localStorage).
 */
export const DATA_DIR = path.join(process.cwd(), "data");

export type Topic = {
  /** URL-safe id, e.g. "Advanced_Array" (filename without extension). */
  slug: string;
  /** File name on disk, e.g. "Advanced_Array.js". */
  fileName: string;
  /** Human-friendly title, e.g. "Advanced Array". */
  title: string;
  /** Line count of the file. */
  lines: number;
  /** Size in bytes. */
  size: number;
  /** ISO timestamp of last modification. */
  modified: string;
  /** Derived difficulty badge. */
  difficulty: "Beginner" | "Intermediate" | "Advanced";
};

/** Turn a file name into a clean, readable title. */
export function toTitle(fileName: string): string {
  const base = fileName.replace(/\.js$/i, "");
  return base
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2") // split camelCase
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Difficulty is a rough heuristic based on how much code the file holds. */
function difficultyFor(lines: number): Topic["difficulty"] {
  if (lines < 20) return "Beginner";
  if (lines < 45) return "Intermediate";
  return "Advanced";
}

/**
 * Reject anything that isn't a plain "<name>.js" living directly in /data.
 * Prevents path traversal (e.g. "../../etc/passwd") through the API.
 */
export function safeFilePath(slug: string): string {
  const fileName = slug.endsWith(".js") ? slug : `${slug}.js`;
  const base = path.basename(fileName);
  if (base !== fileName || !/^[\w.\- ]+\.js$/i.test(base)) {
    throw new Error("Invalid topic name");
  }
  return path.join(DATA_DIR, base);
}

export async function listTopics(): Promise<Topic[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const entries = await fs.readdir(DATA_DIR);
  const jsFiles = entries.filter((f) => f.toLowerCase().endsWith(".js"));

  const topics = await Promise.all(
    jsFiles.map(async (fileName) => {
      const full = path.join(DATA_DIR, fileName);
      const [content, stat] = await Promise.all([
        fs.readFile(full, "utf8"),
        fs.stat(full),
      ]);
      const lines = content.split("\n").length;
      return {
        slug: fileName.replace(/\.js$/i, ""),
        fileName,
        title: toTitle(fileName),
        lines,
        size: stat.size,
        modified: stat.mtime.toISOString(),
        difficulty: difficultyFor(lines),
      } satisfies Topic;
    }),
  );

  // Most recently edited first — matches how you'd revisit practice.
  return topics.sort((a, b) => b.modified.localeCompare(a.modified));
}

export async function readTopic(
  slug: string,
): Promise<{ topic: Topic; content: string } | null> {
  try {
    const full = safeFilePath(slug);
    const [content, stat] = await Promise.all([
      fs.readFile(full, "utf8"),
      fs.stat(full),
    ]);
    const fileName = path.basename(full);
    const lines = content.split("\n").length;
    return {
      content,
      topic: {
        slug: fileName.replace(/\.js$/i, ""),
        fileName,
        title: toTitle(fileName),
        lines,
        size: stat.size,
        modified: stat.mtime.toISOString(),
        difficulty: difficultyFor(lines),
      },
    };
  } catch {
    return null;
  }
}
