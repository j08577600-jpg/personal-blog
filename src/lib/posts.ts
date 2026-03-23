import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schema — runtime validation for MDX frontmatter
// ---------------------------------------------------------------------------

const PostFrontmatterSchema = z.object({
  title: z
    .string()
    .min(1, "title 不能为空"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date 格式须为 yyyy-MM-dd"),
  slug: z
    .string()
    .min(1, "slug 不能为空"),
  excerpt: z
    .string()
    .min(1, "excerpt 不能为空"),
  tags: z.array(z.string()).default([]),
  published: z.boolean(),
  cover: z.string().optional(),
});

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

// ---------------------------------------------------------------------------
// Post type
// ---------------------------------------------------------------------------

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
  content: string; // 原始 MDX 字符串
  published: boolean;
  cover?: string;
};

// ---------------------------------------------------------------------------
// Post status for dashboard
// ---------------------------------------------------------------------------

export type PostStatus = "published" | "draft" | "invalid";

// Raw entry returned by getAllPostEntries() — used by the dashboard
export type PostEntry = {
  fileName: string;
  status: PostStatus;
  post: Post | null;
  // Only set when status === "invalid"
  validationError?: string;
  // Only set when status !== "invalid"
  frontmatter?: PostFrontmatter;
};

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const POSTS_DIR = path.join(process.cwd(), "content/posts");

/**
 * Parse a single MDX file and validate its frontmatter with Zod.
 * Returns { post, error } — exactly one is non-null.
 */
function parseAndValidate(
  fileName: string
): { post: Post | null; error: string | null } {
  const fullPath = path.join(POSTS_DIR, fileName);
  let rawData: Record<string, unknown>;

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    rawData = data as Record<string, unknown>;
    const rt = readingTime(content);

    // Zod 验证
    const result = PostFrontmatterSchema.safeParse(rawData);

    if (!result.success) {
      const messages = result.error.issues
        .map((i) => `[${i.path.join(".")}] ${i.message}`)
        .join("; ");
      return { post: null, error: messages };
    }

    const fm = result.data;
    return {
      post: {
        slug: fm.slug,
        title: fm.title,
        excerpt: fm.excerpt,
        date: fm.date,
        tags: fm.tags,
        published: fm.published,
        cover: fm.cover,
        readingTime: rt.text,
        content,
      },
      error: null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { post: null, error: `文件读取失败: ${msg}` };
  }
}

/**
 * Build a PostEntry from a file name (no status determination).
 */
function buildPostEntry(fileName: string): PostEntry {
  const { post, error } = parseAndValidate(fileName);

  if (error) {
    return { fileName, status: "invalid", post: null, validationError: error };
  }

  if (!post) {
    // Shouldn't happen but guard anyway
    return {
      fileName,
      status: "invalid",
      post: null,
      validationError: "未知解析错误",
    };
  }

  return {
    fileName,
    status: post.published ? "published" : "draft",
    post,
    frontmatter: {
      title: post.title,
      date: post.date,
      slug: post.slug,
      excerpt: post.excerpt,
      tags: post.tags,
      published: post.published,
      cover: post.cover,
    },
  };
}

// ---------------------------------------------------------------------------
// Public API — safe for public pages
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Tag aggregation
// ---------------------------------------------------------------------------

export type TagWithCount = {
  tag: string;
  count: number;
};

/**
 * Returns all unique tags with their post counts (published posts only).
 * Sorted by count descending, then alphabetically.
 */
export function getAllTags(): TagWithCount[] {
  const posts = getPosts();
  const counts: Record<string, number> = {};

  for (const post of posts) {
    for (const tag of post.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
 * Returns published posts that have the given tag.
 * Returns empty array if tag doesn't exist or has no posts.
 */
export function getPostsByTag(tag: string): Post[] {
  return getPosts().filter((post) => post.tags.includes(tag));
}

// ---------------------------------------------------------------------------
// Public API — safe for public pages
// ---------------------------------------------------------------------------

/**
 * Returns only valid, published posts sorted by date descending.
 * Used by public blog pages — never surfaces drafts or invalid posts.
 */
export function getPosts(): Post[] {
  try {
    const fileNames = fs.readdirSync(POSTS_DIR);
    return fileNames
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map((f) => parseAndValidate(f))
      .filter((r): r is { post: Post; error: null } => r.error === null && r.post !== null && r.post.published)
      .map((r) => r.post)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch {
    return [];
  }
}

/**
 * Returns a single post by slug.
 * Returns null for invalid, unpublished, or missing posts.
 * Used by /blog/[slug].
 */
export function getPostBySlug(slug: string): Post | null {
  try {
    const fileNames = fs.readdirSync(POSTS_DIR);
    for (const fileName of fileNames) {
      if (!fileName.endsWith(".mdx") && !fileName.endsWith(".md")) continue;
      const { post } = parseAndValidate(fileName);
      if (post && post.slug === slug) return post;
    }
  } catch {}
  return null;
}

// ---------------------------------------------------------------------------
// Dashboard API — includes drafts and invalid posts
// ---------------------------------------------------------------------------

/**
 * Returns all post entries with their status, including drafts and invalid ones.
 * Intended for author dashboard use only — NOT exposed on public routes.
 */
export function getAllPostEntries(): PostEntry[] {
  try {
    const fileNames = fs.readdirSync(POSTS_DIR);
    return fileNames
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map(buildPostEntry)
      .sort((a, b) => {
        // Invalid first, then drafts, then published
        const order: Record<PostStatus, number> = { invalid: 0, draft: 1, published: 2 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        // Within same status, sort by date desc
        const dateA = a.post?.date ?? "";
        const dateB = b.post?.date ?? "";
        return dateA < dateB ? 1 : -1;
      });
  } catch {
    return [];
  }
}

/**
 * Returns only valid posts (published + drafts), sorted by date desc.
 * Useful for dashboard content overview.
 */
export function getAllValidPosts(): Post[] {
  return getAllPostEntries()
    .filter((e) => e.status !== "invalid" && e.post !== null)
    .map((e) => e.post as Post)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
