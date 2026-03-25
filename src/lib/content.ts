export type ContentType = "post" | "project" | "note" | "reading";

export type SharedContentMeta = {
  type: ContentType;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  published: boolean;
};

export function isPublishedContent(published: boolean | undefined): boolean {
  return published === true;
}

export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.filter((tag): tag is string => typeof tag === "string" && tag.length > 0);
}

function stripMdx(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^}]+\}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildExcerpt(content: string, fallback?: string, maxChars = 120): string {
  const source = fallback?.trim() || stripMdx(content);

  if (source.length <= maxChars) {
    return source;
  }

  return `${source.slice(0, maxChars).trim()}…`;
}

export function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.date < b.date ? 1 : -1));
}
