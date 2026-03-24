import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getAllPostEntries, getAllTags } from "@/lib/posts";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

export type PostEditorInput = {
  originalSlug?: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string;
  published: boolean;
  content: string;
};

export type EditorSeed = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string;
  published: boolean;
  content: string;
  fileName?: string;
};

function requireSafeSlug(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("slug 只能包含小写字母、数字和连字符");
  }
}

function requireSafeDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("date 格式必须是 yyyy-MM-dd");
  }
}

function normalizeTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildFileName(date: string, slug: string) {
  return `${date}_${slug}.mdx`;
}

function buildFilePath(fileName: string) {
  return path.join(POSTS_DIR, fileName);
}

function ensurePostsDir() {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

export function createEmptyEditorSeed(): EditorSeed {
  const today = new Date().toISOString().slice(0, 10);
  return {
    title: "",
    slug: "",
    date: today,
    excerpt: "",
    tags: "",
    published: false,
    content: "",
  };
}

export function getEditorSeedBySlug(slug: string): EditorSeed | null {
  const entry = getAllPostEntries().find((item) => item.post?.slug === slug && item.post);
  if (!entry?.post) return null;

  const fullPath = buildFilePath(entry.fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(raw);

  return {
    title: entry.post.title,
    slug: entry.post.slug,
    date: entry.post.date,
    excerpt: entry.post.excerpt,
    tags: entry.post.tags.join(", "),
    published: entry.post.published,
    content: parsed.content.trim(),
    fileName: entry.fileName,
  };
}

export function savePostFromEditor(input: PostEditorInput) {
  ensurePostsDir();

  const title = input.title.trim();
  const slug = input.slug.trim();
  const date = input.date.trim();
  const excerpt = input.excerpt.trim();
  const content = input.content.replace(/\r\n/g, "\n").trim();

  if (!title) throw new Error("title 不能为空");
  if (!excerpt) throw new Error("excerpt 不能为空");
  if (!content) throw new Error("正文不能为空");

  requireSafeSlug(slug);
  requireSafeDate(date);

  const tags = normalizeTags(input.tags);
  const nextFileName = buildFileName(date, slug);
  const nextPath = buildFilePath(nextFileName);

  const existing = getAllPostEntries();
  const conflict = existing.find((entry) => entry.post?.slug === slug && entry.post?.slug !== input.originalSlug);
  if (conflict) {
    throw new Error("slug 已存在，请换一个");
  }

  const fileBody = matter.stringify(content + "\n", {
    title,
    date,
    slug,
    excerpt,
    tags,
    published: input.published,
  });

  fs.writeFileSync(nextPath, fileBody, "utf8");

  if (input.originalSlug && input.originalSlug !== slug) {
    const previous = existing.find((entry) => entry.post?.slug === input.originalSlug);
    if (previous) {
      const previousPath = buildFilePath(previous.fileName);
      if (previousPath !== nextPath && fs.existsSync(previousPath)) {
        fs.unlinkSync(previousPath);
      }
    }
  }

  return { slug, fileName: nextFileName };
}

export function getDashboardStats() {
  const entries = getAllPostEntries();
  const published = entries.filter((entry) => entry.status === "published");
  const drafts = entries.filter((entry) => entry.status === "draft");
  const invalid = entries.filter((entry) => entry.status === "invalid");
  const tags = getAllTags();
  return {
    total: entries.length,
    published: published.length,
    drafts: drafts.length,
    invalid: invalid.length,
    tagCount: tags.length,
    newestPublished: published[0]?.post?.date ?? null,
  };
}
