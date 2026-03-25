import type { Post } from "@/lib/posts";
import type { Project } from "@/lib/projects";

export type SearchEntryType = "post" | "project";

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

export function mapPostToSearchEntry(post: Post): SearchEntry {
  return {
    type: "post",
    slug: post.slug,
    href: `/blog/${post.slug}`,
    title: post.title,
    excerpt: post.excerpt,
    tags: post.tags,
    date: post.date,
    section: "文章",
    searchText: buildSearchText([post.title, post.excerpt, post.tags]),
  };
}

export function mapProjectToSearchEntry(project: Project): SearchEntry {
  return {
    type: "project",
    slug: project.slug,
    href: `/projects/${project.slug}`,
    title: project.title,
    excerpt: project.excerpt,
    tags: project.tech?.length ? project.tech : project.tags,
    date: project.date,
    section: "项目",
    searchText: buildSearchText([
      project.title,
      project.excerpt,
      project.tags,
      project.tech,
      project.status,
    ]),
  };
}

export function buildSearchIndex(posts: Post[], projects: Project[]): SearchEntry[] {
  return [
    ...posts.map(mapPostToSearchEntry),
    ...projects.map(mapProjectToSearchEntry),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
}
