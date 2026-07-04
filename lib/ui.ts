import type { Topic } from "./topics";

export type Accent = "orange" | "purple" | "teal";

/** Deterministically pick an accent color from a topic name. */
export function accentFor(slug: string): Accent {
  const accents: Accent[] = ["orange", "purple", "teal"];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return accents[hash % accents.length];
}

/** Tailwind class fragments per accent — kept static so JIT can see them. */
export const accentClasses: Record<
  Accent,
  { text: string; ring: string; glow: string; chip: string; dot: string }
> = {
  orange: {
    text: "text-accent-orange",
    ring: "hover:border-accent-orange/50",
    glow: "hover:shadow-[0_0_30px_-8px_rgba(255,138,61,0.55)]",
    chip: "bg-accent-orange/10 text-accent-orange border-accent-orange/20",
    dot: "bg-accent-orange",
  },
  purple: {
    text: "text-accent-purple",
    ring: "hover:border-accent-purple/50",
    glow: "hover:shadow-[0_0_30px_-8px_rgba(168,85,247,0.55)]",
    chip: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
    dot: "bg-accent-purple",
  },
  teal: {
    text: "text-accent-teal",
    ring: "hover:border-accent-teal/50",
    glow: "hover:shadow-[0_0_30px_-8px_rgba(45,212,191,0.55)]",
    chip: "bg-accent-teal/10 text-accent-teal border-accent-teal/20",
    dot: "bg-accent-teal",
  },
};

export const difficultyChip: Record<Topic["difficulty"], string> = {
  Beginner: "bg-accent-teal/10 text-accent-teal border-accent-teal/20",
  Intermediate: "bg-accent-orange/10 text-accent-orange border-accent-orange/20",
  Advanced: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
};

/** "3 days ago" style relative time — friendlier than a raw timestamp. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
