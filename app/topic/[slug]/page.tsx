import { notFound } from "next/navigation";
import { readTopic } from "@/lib/topics";
import { TopicEditorClient } from "@/components/TopicEditorClient";

export const dynamic = "force-dynamic";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const result = await readTopic(decodedSlug);

  const initialTopic = result?.topic ?? {
    slug: decodedSlug,
    fileName: `${decodedSlug}.js`,
    title: decodedSlug.replace(/[_-]+/g, " "),
    lines: 0,
    size: 0,
    modified: new Date().toISOString(),
    difficulty: "Beginner"
  };
  const initialContent = result?.content ?? "";

  return (
    <TopicEditorClient 
      topic={initialTopic} 
      initialContent={initialContent} 
      isLocalFallback={!result}
    />
  );
}
