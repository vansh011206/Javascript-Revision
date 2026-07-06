import fs from "fs/promises";
import path from "path";

import clientPromise from "@/lib/db";

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

const COLLECTION_NAME = "topics";

async function getCollection() {
  if (!clientPromise) return null;
  const client = await clientPromise;
  return client.db().collection(COLLECTION_NAME);
}

/** Turn a file name into a clean, readable title. */
export function toTitle(fileName: string): string {
  const base = fileName.replace(/\.js$/i, "");
  return base
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2") // split camelCase
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Difficulty is determined by keywords in the topic slug (name). */
function difficultyFor(slug: string): Topic["difficulty"] {
  const name = slug.toLowerCase().replace(/[_-]/g, "");

  // Advanced topics
  const advancedKeywords = [
    "advanced", "destruct", "spread", "rest", "promise", "async", "await", 
    "callback", "closure", "hoisting", "prototype", "class", "inheritance", 
    "bind", "call", "apply", "generator", "iterator", "module", "lexical", "scope"
  ];

  // Intermediate topics
  const intermediateKeywords = [
    "function", "arrow", "array", "object", "foreach", "map", "filter", "reduce", 
    "template", "templet", "try", "catch", "exception", "error", "math", "date", "regex"
  ];

  if (advancedKeywords.some((keyword) => name.includes(keyword))) {
    return "Advanced";
  }

  if (intermediateKeywords.some((keyword) => name.includes(keyword))) {
    return "Intermediate";
  }

  // Default to Beginner (for variables, datatypes, operators, loops, ifelse, etc.)
  return "Beginner";
}

/**
 * Seed the MongoDB database with local files from disk if the DB is empty.
 * This guarantees the user's progress is preserved.
 */
async function ensureSeeded() {
  const collection = await getCollection();
  if (!collection) return;
  
  try {
    const count = await collection.countDocuments();
    if (count === 0) {
      console.log("Seeding MongoDB with local topics from disk...");
      await fs.mkdir(DATA_DIR, { recursive: true });
      const entries = await fs.readdir(DATA_DIR);
      const jsFiles = entries.filter((f) => f.toLowerCase().endsWith(".js"));

      for (const fileName of jsFiles) {
        const full = path.join(DATA_DIR, fileName);
        const [content, stat] = await Promise.all([
          fs.readFile(full, "utf8"),
          fs.stat(full),
        ]);
        const lines = content.split("\n").length;
        const slug = fileName.replace(/\.js$/i, "");
        const difficulty = difficultyFor(slug);

        const topicDoc = {
          _id: slug,
          slug,
          fileName,
          title: toTitle(fileName),
          lines,
          size: stat.size,
          modified: stat.mtime.toISOString(),
          difficulty,
          content,
        };
        await collection.replaceOne({ slug }, topicDoc, { upsert: true });
      }
      console.log("Seeding complete!");
    }
  } catch (err) {
    console.error("Failed to seed MongoDB:", err);
  }
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
  const collection = await getCollection();
  if (collection) {
    await ensureSeeded();
    const docs = await collection.find({}).project({ content: 0 }).toArray();
    const topics = docs.map((doc: any) => ({
      slug: doc.slug,
      fileName: doc.fileName,
      title: doc.title,
      lines: doc.lines,
      size: doc.size,
      modified: doc.modified,
      difficulty: doc.difficulty,
    })) as Topic[];
    return topics.sort((a, b) => b.modified.localeCompare(a.modified));
  }

  // Fallback to disk
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
      const slug = fileName.replace(/\.js$/i, "");
      return {
        slug,
        fileName,
        title: toTitle(fileName),
        lines,
        size: stat.size,
        modified: stat.mtime.toISOString(),
        difficulty: difficultyFor(slug),
      } satisfies Topic;
    }),
  );

  // Most recently edited first — matches how you'd revisit practice.
  return topics.sort((a, b) => b.modified.localeCompare(a.modified));
}

export async function readTopic(
  slug: string,
): Promise<{ topic: Topic; content: string } | null> {
  const collection = await getCollection();
  if (collection) {
    const doc = await collection.findOne({ slug });
    if (!doc) return null;
    return {
      content: doc.content,
      topic: {
        slug: doc.slug,
        fileName: doc.fileName,
        title: doc.title,
        lines: doc.lines,
        size: doc.size,
        modified: doc.modified,
        difficulty: doc.difficulty,
      },
    };
  }

  // Fallback to disk
  try {
    const full = safeFilePath(slug);
    const [content, stat] = await Promise.all([
      fs.readFile(full, "utf8"),
      fs.stat(full),
    ]);
    const fileName = path.basename(full);
    const lines = content.split("\n").length;
    const topicSlug = fileName.replace(/\.js$/i, "");
    return {
      content,
      topic: {
        slug: topicSlug,
        fileName,
        title: toTitle(fileName),
        lines,
        size: stat.size,
        modified: stat.mtime.toISOString(),
        difficulty: difficultyFor(topicSlug),
      },
    };
  } catch {
    return null;
  }
}

export async function writeTopic(
  slug: string,
  content: string,
): Promise<{ topic: Topic; content: string }> {
  const fileName = `${slug}.js`;
  const title = toTitle(fileName);
  const lines = content.split("\n").length;
  const modified = new Date().toISOString();
  const difficulty = difficultyFor(slug);

  const topic: Topic = {
    slug,
    fileName,
    title,
    lines,
    size: content.length,
    modified,
    difficulty,
  };

  const collection = await getCollection();
  if (collection) {
    const doc = {
      _id: slug,
      slug,
      fileName,
      title,
      lines,
      size: content.length,
      modified,
      difficulty,
      content,
    };
    await collection.replaceOne({ slug }, doc, { upsert: true });
    return { topic, content };
  }

  // Fallback to disk
  const full = safeFilePath(slug);
  await fs.writeFile(full, content, "utf8");
  return { topic, content };
}

export async function removeTopic(slug: string): Promise<boolean> {
  const collection = await getCollection();
  if (collection) {
    const result = await collection.deleteOne({ slug });
    return result.deletedCount > 0;
  }

  // Fallback to disk
  const full = safeFilePath(slug);
  await fs.unlink(full);
  return true;
}
