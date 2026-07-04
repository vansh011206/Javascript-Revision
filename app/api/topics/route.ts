import { NextResponse } from "next/server";
import fs from "fs/promises";
import { listTopics, safeFilePath, toTitle } from "@/lib/topics";

// Always read fresh from disk — never cache the file listing.
export const dynamic = "force-dynamic";

/** GET /api/topics → list every practice file with metadata. */
export async function GET() {
  const topics = await listTopics();
  return NextResponse.json({ topics });
}

/**
 * POST /api/topics → create a brand-new practice file.
 * Body: { name: string, content?: string }
 * Returns the created topic's slug so the UI can navigate/refresh.
 */
export async function POST(request: Request) {
  let body: { name?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawName = (body.name ?? "").trim();
  if (!rawName) {
    return NextResponse.json({ error: "A topic name is required" }, { status: 400 });
  }

  // Normalise the name into a safe "<Name>.js" file.
  const cleaned = rawName.replace(/\.js$/i, "").replace(/[^\w\- ]+/g, "").trim();
  if (!cleaned) {
    return NextResponse.json(
      { error: "Name must contain letters, numbers, spaces, - or _" },
      { status: 400 },
    );
  }
  const fileName = `${cleaned.replace(/\s+/g, "_")}.js`;

  let full: string;
  try {
    full = safeFilePath(fileName);
  } catch {
    return NextResponse.json({ error: "Invalid topic name" }, { status: 400 });
  }

  // Don't clobber an existing file.
  try {
    await fs.access(full);
    return NextResponse.json(
      { error: "A topic with that name already exists" },
      { status: 409 },
    );
  } catch {
    // ENOENT = good, the file is free to create.
  }

  const content =
    body.content ?? `// ${toTitle(fileName)}\n// Written in the JS Practice Vault notebook.\n\n`;
  await fs.writeFile(full, content, "utf8");

  const slug = fileName.replace(/\.js$/i, "");
  return NextResponse.json({ slug, fileName }, { status: 201 });
}
