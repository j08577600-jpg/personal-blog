import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";
import { buildExcerpt, type SharedContentMeta } from "@/lib/content";

const DateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式须为 yyyy-MM-dd");

export const PostFrontmatterSchema = z.object({
  title: z.string().min(1, "title 不能为空"),
  date: DateStringSchema,
  slug: z.string().min(1, "slug 不能为空"),
  excerpt: z.string().min(1, "excerpt 不能为空"),
  tags: z.array(z.string()).default([]),
  published: z.boolean(),
  cover: z.string().optional(),
  series: z.string().min(1, "series 不能为空").optional(),
  recommended: z.boolean().optional(),
  updatedAt: DateStringSchema.optional(),
  updateNote: z.string().min(1, "updateNote 不能为空").optional(),
});

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
  content: string;
  published: boolean;
  cover?: string;
  series?: string;
  recommended?: boolean;
  updatedAt?: string;
  updateNote?: string;
};

export type PostStatus = "published" | "draft" | "invalid";

export type PostEntry = {
  fileName: string;
  status: PostStatus;
  post: Post | null;
  validationError?: string;
  frontmatter?: PostFrontmatter;
};

export type PublicPostMeta = SharedContentMeta & {
  type: "post";
};

export const POSTS_DIR = path.join(process.cwd(), "content/posts");

export function parsePostFile(fullPath: string) {
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontmatter = PostFrontmatterSchema.parse(data);

  return {
    frontmatter,
    content,
  };
}

function parseAndValidate(fileName: string): { post: Post | null; error: string | null } {
  const fullPath = path.join(POSTS_DIR, fileName);

  try {
    const { frontmatter, content } = parsePostFile(fullPath);
    const rt = readingTime(content);

    return {
      post: {
        slug: frontmatter.slug,
        title: frontmatter.title,
        excerpt: frontmatter.excerpt,
        date: frontmatter.date,
        tags: frontmatter.tags,
        published: frontmatter.published,
        cover: frontmatter.cover,
        series: frontmatter.series,
        recommended: frontmatter.recommended ?? false,
        updatedAt: frontmatter.updatedAt,
        updateNote: frontmatter.updateNote,
        readingTime: rt.text,
        content,
      },
      error: null,
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const messages = err.issues
        .map((issue) => `[${issue.path.join(".")}] ${issue.message}`)
        .join("; ");
      return { post: null, error: messages };
    }

    const msg = err instanceof Error ? err.message : String(err);
    return { post: null, error: `文件读取失败: ${msg}` };
  }
}

function buildPostEntry(fileName: string): PostEntry {
  const { post, error } = parseAndValidate(fileName);

  if (error) {
    return { fileName, status: "invalid", post: null, validationError: error };
  }

  if (!post) {
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
      series: post.series,
      recommended: post.recommended,
      updatedAt: post.updatedAt,
      updateNote: post.updateNote,
    },
  };
}

export function getPosts(): Post[] {
  try {
    const fileNames = fs.readdirSync(POSTS_DIR);
    return fileNames
      .filter((fileName) => fileName.endsWith(".mdx") || fileName.endsWith(".md"))
      .map((fileName) => parseAndValidate(fileName))
      .filter(
        (result): result is { post: Post; error: null } =>
          result.error === null && result.post !== null && result.post.published
      )
      .map((result) => result.post)
      .sort((a, b) => {
        if (a.recommended !== b.recommended) {
          return a.recommended ? -1 : 1;
        }
        return a.date < b.date ? 1 : -1;
      });
  } catch {
    return [];
  }
}

function findPostBySlug(slug: string, options?: { includeDrafts?: boolean }): Post | null {
  try {
    const fileNames = fs.readdirSync(POSTS_DIR);
    for (const fileName of fileNames) {
      if (!fileName.endsWith(".mdx") && !fileName.endsWith(".md")) continue;
      const { post } = parseAndValidate(fileName);
      if (!post || post.slug !== slug) continue;
      if (!options?.includeDrafts && !post.published) continue;
      return post;
    }
  } catch {}

  return null;
}

export function getPostBySlug(slug: string): Post | null {
  return findPostBySlug(slug);
}

export function getPostBySlugForAuthor(slug: string): Post | null {
  return findPostBySlug(slug, { includeDrafts: true });
}

export function getAllPostEntries(): PostEntry[] {
  try {
    const fileNames = fs.readdirSync(POSTS_DIR);
    return fileNames
      .filter((fileName) => fileName.endsWith(".mdx") || fileName.endsWith(".md"))
      .map(buildPostEntry)
      .sort((a, b) => {
        const order: Record<PostStatus, number> = { invalid: 0, draft: 1, published: 2 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        const dateA = a.post?.date ?? "";
        const dateB = b.post?.date ?? "";
        return dateA < dateB ? 1 : -1;
      });
  } catch {
    return [];
  }
}

export function getAllValidPosts(): Post[] {
  return getAllPostEntries()
    .filter((entry) => entry.status !== "invalid" && entry.post !== null)
    .map((entry) => entry.post as Post)
    .sort((a, b) => {
      if (a.recommended !== b.recommended) {
        return a.recommended ? -1 : 1;
      }
      return a.date < b.date ? 1 : -1;
    });
}

export function getRecommendedPosts(limit?: number, excludeSlug?: string): Post[] {
  const recommended = getPosts().filter((post) => post.recommended && post.slug !== excludeSlug);
  return typeof limit === "number" ? recommended.slice(0, limit) : recommended;
}

export function getPostsInSeries(series: string, excludeSlug?: string): Post[] {
  return getPosts()
    .filter((post) => post.series === series && post.slug !== excludeSlug)
    .sort((a, b) => (a.date > b.date ? 1 : -1));
}

export function getPublicPostsMeta(): PublicPostMeta[] {
  return getPosts().map((post) => ({
    type: "post" as const,
    slug: post.slug,
    title: post.title,
    excerpt: buildExcerpt(post.content, post.excerpt),
    date: post.date,
    tags: post.tags,
    published: post.published,
  }));
}

export type TagEntry = {
  tag: string;
  count: number;
};

export function getAllTags(): TagEntry[] {
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
