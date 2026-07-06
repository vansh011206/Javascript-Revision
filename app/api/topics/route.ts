import { NextResponse } from "next/server";
import { listTopics, readTopic, writeTopic, toTitle } from "@/lib/topics";

// Always read fresh from disk/DB — never cache the file listing.
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
  try {
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
    const slug = fileName.replace(/\.js$/i, "");

    // Don't clobber an existing file.
    const existing = await readTopic(slug);
    if (existing) {
      return NextResponse.json(
        { error: "A topic with that name already exists" },
        { status: 409 },
      );
    }

    const content =
      body.content ?? `// ${toTitle(fileName)}\n// Written in the JS Practice Vault notebook.\n\n`;
    
    await writeTopic(slug, content);

    return NextResponse.json({ slug, fileName }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/topics:", error);
    return NextResponse.json(
      { error: error.message ?? "Internal Server Error" },
      { status: 500 },
    );
  }
}
