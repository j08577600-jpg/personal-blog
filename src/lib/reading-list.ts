import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReadingItemType = "book" | "article" | "video" | "post";

export type ReadingItemStatus =
  | "want-to-read"
  | "reading"
  | "completed"
  | "abandoned";

export type ReadingItem = {
  slug: string;
  title: string;
  date: string;
  type: ReadingItemType;
  author?: string;
  source?: string;
  url?: string;
  status: ReadingItemStatus;
  rating?: number; // 1-5
  tags: string[];
  content: string;
  published: boolean;
  readingTime: string;
};

// ---------------------------------------------------------------------------
// Status labels & colors
// ---------------------------------------------------------------------------

export const READING_STATUS_LABELS: Record<ReadingItemStatus, string> = {
  "want-to-read": "想读",
  reading: "在读",
  completed: "已读完",
  abandoned: "已弃坑",
};

export const READING_STATUS_COLORS: Record<ReadingItemStatus, string> = {
  "want-to-read":
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  reading:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  abandoned:
    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

export const READING_TYPE_LABELS: Record<ReadingItemType, string> = {
  book: "书籍",
  article: "文章",
  video: "视频",
  post: "博客",
};

export const READING_TYPE_COLORS: Record<ReadingItemType, string> = {
  book: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  article:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  video: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  post: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

// Status display order
export const READING_STATUS_ORDER: ReadingItemStatus[] = [
  "reading",
  "want-to-read",
  "completed",
  "abandoned",
];

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const READING_LIST_DIR = path.join(process.cwd(), "content/reading-list");

function parseReadingItem(fileName: string): ReadingItem | null {
  const fullPath = path.join(READING_LIST_DIR, fileName);
  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const slug = data.slug as string | undefined;
    const title = data.title as string | undefined;
    const date = data.date as string | undefined;
    const status = data.status as ReadingItemStatus | undefined;
    const type = data.type as ReadingItemType | undefined;

    if (!slug || !title || !date || !status || !type) return null;

    const rt = readingTime(content);

    return {
      slug,
      title,
      date,
      type,
      author: data.author as string | undefined,
      source: data.source as string | undefined,
      url: data.url as string | undefined,
      status,
      rating: data.rating as number | undefined,
      tags: (data.tags as string[]) ?? [],
      content,
      published: (data.published as boolean) ?? false,
      readingTime: rt.text,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type ReadingListGroup = {
  status: ReadingItemStatus;
  label: string;
  items: ReadingItem[];
};

/**
 * Returns published reading items grouped by status.
 * Order: reading → want-to-read → completed → abandoned
 */
export function getReadingList(): ReadingListGroup[] {
  try {
    const fileNames = fs.readdirSync(READING_LIST_DIR);
    const allItems = fileNames
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map(parseReadingItem)
      .filter((r): r is ReadingItem => r !== null && r.published);

    const groups: Record<ReadingItemStatus, ReadingItem[]> = {
      "want-to-read": [],
      reading: [],
      completed: [],
      abandoned: [],
    };

    for (const item of allItems) {
      groups[item.status].push(item);
    }

    return READING_STATUS_ORDER.map((status) => ({
      status,
      label: READING_STATUS_LABELS[status],
      items: groups[status].sort((a, b) =>
        a.date < b.date ? 1 : -1
      ),
    })).filter((g) => g.items.length > 0);
  } catch {
    return [];
  }
}

/**
 * Returns a single reading item by slug, or null if not found/not published.
 */
export function getReadingItemBySlug(slug: string): ReadingItem | null {
  try {
    const fileNames = fs.readdirSync(READING_LIST_DIR);
    for (const fileName of fileNames) {
      if (!fileName.endsWith(".mdx") && !fileName.endsWith(".md")) continue;
      const item = parseReadingItem(fileName);
      if (item && item.slug === slug) return item;
    }
  } catch {}
  return null;
}

/**
 * Returns all reading item slugs for static generation.
 */
export function getAllReadingItemSlugs(): string[] {
  try {
    const fileNames = fs.readdirSync(READING_LIST_DIR);
    return fileNames
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map(parseReadingItem)
      .filter((r): r is ReadingItem => r !== null && r.published)
      .map((r) => r.slug);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export type TagEntry = { tag: string; count: number };

export function getAllReadingItemTags(): TagEntry[] {
  const groups = getReadingList();
  const counts: Record<string, number> = {};
  for (const group of groups) {
    for (const item of group.items) {
      for (const tag of item.tags) {
        counts[tag] = (counts[tag] ?? 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
