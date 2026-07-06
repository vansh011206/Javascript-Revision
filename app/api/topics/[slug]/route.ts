import { NextResponse } from "next/server";
import fs from "fs/promises";
import { readTopic, safeFilePath } from "@/lib/topics";

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

    let full: string;
    try {
      full = safeFilePath(decodeURIComponent(slug));
    } catch {
      return NextResponse.json({ error: "Invalid topic name" }, { status: 400 });
    }

    try {
      await fs.access(full); // must already exist to be edited
    } catch {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    await fs.writeFile(full, body.content, "utf8");
    const stat = await fs.stat(full);
    return NextResponse.json({ ok: true, modified: stat.mtime.toISOString() });
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

    let full: string;
    try {
      full = safeFilePath(decodeURIComponent(slug));
    } catch {
      return NextResponse.json({ error: "Invalid topic name" }, { status: 400 });
    }

    try {
      await fs.access(full); // check if exists before deleting
    } catch {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    try {
      await fs.unlink(full);
    } catch {
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
