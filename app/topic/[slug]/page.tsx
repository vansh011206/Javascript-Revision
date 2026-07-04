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
  const result = await readTopic(decodeURIComponent(slug));
  if (!result) notFound();

  return (
    <TopicEditorClient topic={result.topic} initialContent={result.content} />
  );
}
