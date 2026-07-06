import { NextResponse } from "next/server";
import { readTopic, writeTopic, removeTopic } from "@/lib/topics";

export const dynamic = "force-dynamic";

/** GET /api/topics/:slug → the file's content + metadata. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const result = await readTopic(decodeURIComponent(slug));
  if (!result) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}

/**
 * PUT /api/topics/:slug → overwrite the file with edited code.
 * Body: { content: string }
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    let body: { content?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof body.content !== "string") {
      return NextResponse.json({ error: "content must be a string" }, { status: 400 });
    }

    const decodedSlug = decodeURIComponent(slug);
    const existing = await readTopic(decodedSlug);
    if (!existing) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const { topic } = await writeTopic(decodedSlug, body.content);
    return NextResponse.json({ ok: true, modified: topic.modified });
  } catch (error: any) {
    console.error("Error in PUT /api/topics/[slug]:", error);
    return NextResponse.json(
      { error: error.message ?? "Internal Server Error" },
      { status: 500 },
    );
  }
}

/** DELETE /api/topics/:slug → remove a practice file from the vault. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const decodedSlug = decodeURIComponent(slug);
    const existing = await readTopic(decodedSlug);
    if (!existing) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const deleted = await removeTopic(decodedSlug);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/topics/[slug]:", error);
    return NextResponse.json(
      { error: error.message ?? "Internal Server Error" },
      { status: 500 },
    );
  }
}
