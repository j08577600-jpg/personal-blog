import type { PublicPostMeta } from "@/lib/posts";
import type { PublicProjectMeta } from "@/lib/projects";
import type { PublicNoteMeta } from "@/lib/notes";
import type { PublicReadingMeta } from "@/lib/reading-list";

export type SearchEntryType = "post" | "project" | "note" | "reading";

export type SearchEntry = {
  type: SearchEntryType;
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  section: string;
  searchText: string;
};

export const SEARCH_TYPE_LABELS: Record<SearchEntryType, string> = {
  post: "文章",
  project: "项目",
  note: "笔记",
  reading: "阅读",
};

export function normalizeSearchText(value: string): string {
  return value
    .replace(/\u3000/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function buildSearchText(parts: Array<string | string[] | undefined>): string {
  const tokens = parts.flatMap((part) => {
    if (!part) return [];
    return Array.isArray(part) ? part : [part];
  });

  const normalized = tokens
    .map((token) => normalizeSearchText(token))
    .filter(Boolean);

  return Array.from(new Set(normalized)).join(" ");
}

export function normalizeSearchQuery(value: string): string {
  return normalizeSearchText(value);
}

export function getSearchEntryHref(type: SearchEntryType, slug: string): string {
  switch (type) {
    case "post":
      return `/blog/${slug}`;
    case "project":
      return `/projects/${slug}`;
    case "note":
      return `/notes/${slug}`;
    case "reading":
      return `/reading-list/${slug}`;
  }
}

export function mapPostToSearchEntry(post: PublicPostMeta): SearchEntry {
  return {
    type: "post",
    slug: post.slug,
    href: getSearchEntryHref("post", post.slug),
    title: post.title,
    excerpt: post.excerpt,
    tags: post.tags,
    date: post.date,
    section: SEARCH_TYPE_LABELS.post,
    searchText: buildSearchText([post.title, post.excerpt, post.tags]),
  };
}

export function mapProjectToSearchEntry(project: PublicProjectMeta): SearchEntry {
  return {
    type: "project",
    slug: project.slug,
    href: getSearchEntryHref("project", project.slug),
    title: project.title,
    excerpt: project.excerpt,
    tags: project.tags,
    date: project.date,
    section: SEARCH_TYPE_LABELS.project,
    searchText: buildSearchText([
      project.title,
      project.excerpt,
      project.tags,
      project.tech,
      project.status,
    ]),
  };
}

export function mapNoteToSearchEntry(note: PublicNoteMeta): SearchEntry {
  return {
    type: "note",
    slug: note.slug,
    href: getSearchEntryHref("note", note.slug),
    title: note.title,
    excerpt: note.excerpt,
    tags: note.tags,
    date: note.date,
    section: SEARCH_TYPE_LABELS.note,
    searchText: buildSearchText([note.title, note.excerpt, note.tags]),
  };
}

export function mapReadingToSearchEntry(item: PublicReadingMeta): SearchEntry {
  return {
    type: "reading",
    slug: item.slug,
    href: getSearchEntryHref("reading", item.slug),
    title: item.title,
    excerpt: item.excerpt,
    tags: item.tags,
    date: item.date,
    section: SEARCH_TYPE_LABELS.reading,
    searchText: buildSearchText([
      item.title,
      item.excerpt,
      item.tags,
      item.author,
      item.source,
      item.readingType,
      item.status,
    ]),
  };
}

export function buildSearchIndex(
  posts: PublicPostMeta[],
  projects: PublicProjectMeta[],
  notes: PublicNoteMeta[],
  readingItems: PublicReadingMeta[]
): SearchEntry[] {
  return [
    ...posts.map(mapPostToSearchEntry),
    ...projects.map(mapProjectToSearchEntry),
    ...notes.map(mapNoteToSearchEntry),
    ...readingItems.map(mapReadingToSearchEntry),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAvailableSearchTags(entries: SearchEntry[]): string[] {
  return Array.from(new Set(entries.flatMap((entry) => entry.tags)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}
