import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  PostFrontmatterSchema,
  getAllPostEntries,
  parsePostFile,
  POSTS_DIR,
} from "@/lib/posts";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TMP_PREFIX = ".";
const TMP_SUFFIX = ".tmp";
const BACKUP_SUFFIX = ".bak";

export type AuthorPostInput = {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
  tags: string[];
  cover?: string;
  published: boolean;
  body: string;
};

export type AuthorPostPayload = Omit<AuthorPostInput, "tags"> & {
  tags: string[] | string;
};

export type AuthorEditablePost = AuthorPostInput & {
  sourceFileName: string;
  lastKnownMtimeMs: number;
};

export class AuthorPostError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthorPostError";
    this.status = status;
  }
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function slugifyPostValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeTags(tags: unknown) {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeCover(cover: unknown) {
  if (typeof cover !== "string") {
    return undefined;
  }

  const trimmed = cover.trim();
  return trimmed ? trimmed : undefined;
}

export function buildPostFileName(date: string, slug: string) {
  return `${date}_${slug}.mdx`;
}

function buildPostFilePath(fileName: string) {
  return path.join(POSTS_DIR, fileName);
}

function ensurePostsDir() {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

function findPostEntryBySlug(slug: string) {
  return getAllPostEntries().find((entry) => entry.post?.slug === slug) ?? null;
}

function ensureSlugNotUsedByOtherFile(slug: string, currentFileName?: string) {
  const conflictEntry = getAllPostEntries().find(
    (entry) => entry.post?.slug === slug && entry.fileName !== currentFileName
  );

  if (conflictEntry) {
    throw new AuthorPostError(409, "slug 已被其他文件占用，请修改 slug");
  }
}

function readFileStat(filePath: string) {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

function serializePostFile(input: AuthorPostInput) {
  const frontmatter = PostFrontmatterSchema.parse({
    title: input.title.trim(),
    date: input.date,
    slug: input.slug,
    excerpt: input.excerpt.trim(),
    tags: input.tags,
    published: input.published,
    cover: normalizeCover(input.cover),
  });
  const { cover, ...frontmatterWithoutCover } = frontmatter;
  const serializedFrontmatter = cover
    ? { ...frontmatterWithoutCover, cover }
    : frontmatterWithoutCover;

  const content = input.body.replace(/\r\n/g, "\n").trimEnd();
  return `${matter.stringify(content ? `${content}\n` : "", serializedFrontmatter).trimEnd()}\n`;
}

function validateInput(input: Partial<AuthorPostPayload>) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const date = typeof input.date === "string" ? input.date.trim() : getTodayDateString();
  const slugSource = typeof input.slug === "string" ? input.slug.trim() : "";
  const generatedSlug = slugifyPostValue(title) || `untitled-${Date.now()}`;
  const slug = slugifyPostValue(slugSource || generatedSlug);
  const excerpt = typeof input.excerpt === "string" ? input.excerpt.trim() : "";
  const published = Boolean(input.published);
  const body = typeof input.body === "string" ? input.body : "";
  const tags = normalizeTags(input.tags);
  const cover = normalizeCover(input.cover);

  if (!title) {
    throw new AuthorPostError(400, "title 不能为空");
  }

  if (!DATE_PATTERN.test(date)) {
    throw new AuthorPostError(400, "date 格式须为 yyyy-MM-dd");
  }

  if (!slug) {
    throw new AuthorPostError(400, "slug 不能为空");
  }

  if (!SLUG_PATTERN.test(slug)) {
    throw new AuthorPostError(400, "slug 只能包含小写字母、数字和中横线");
  }

  if (!excerpt) {
    throw new AuthorPostError(400, "excerpt 不能为空");
  }

  return {
    title,
    date,
    slug,
    excerpt,
    tags,
    cover,
    published,
    body,
  } satisfies AuthorPostInput;
}

function writeAtomically(targetPath: string, content: string) {
  const directory = path.dirname(targetPath);
  const tempPath = path.join(
    directory,
    `${TMP_PREFIX}${path.basename(targetPath)}.${process.pid}.${Date.now()}${TMP_SUFFIX}`
  );

  fs.writeFileSync(tempPath, content, "utf8");
  fs.renameSync(tempPath, targetPath);
}

function createBackup(sourcePath: string) {
  const backupPath = `${sourcePath}${BACKUP_SUFFIX}`;
  fs.copyFileSync(sourcePath, backupPath);
}

export function createEmptyDraft() {
  return {
    title: "",
    date: getTodayDateString(),
    slug: "",
    excerpt: "",
    tags: [],
    cover: "",
    published: false,
    body: "",
    sourceFileName: "",
    lastKnownMtimeMs: 0,
  } satisfies AuthorEditablePost;
}

export function getEditablePostBySlug(slug: string): AuthorEditablePost {
  const entry = findPostEntryBySlug(slug);

  if (!entry?.post) {
    throw new AuthorPostError(404, "草稿不存在或已被移动");
  }

  const filePath = buildPostFilePath(entry.fileName);
  const parsed = parsePostFile(filePath);
  const stat = readFileStat(filePath);

  if (!stat) {
    throw new AuthorPostError(404, "草稿不存在或已被移动");
  }

  return {
    title: parsed.frontmatter.title,
    date: parsed.frontmatter.date,
    slug: parsed.frontmatter.slug,
    excerpt: parsed.frontmatter.excerpt,
    tags: parsed.frontmatter.tags,
    cover: parsed.frontmatter.cover ?? "",
    published: parsed.frontmatter.published,
    body: parsed.content,
    sourceFileName: entry.fileName,
    lastKnownMtimeMs: stat.mtimeMs,
  };
}

export function createDraft(input: Partial<AuthorPostPayload>) {
  ensurePostsDir();

  const normalized = {
    ...validateInput(input),
    published: false,
  } satisfies AuthorPostInput;
  const fileName = buildPostFileName(normalized.date, normalized.slug);
  const targetPath = buildPostFilePath(fileName);

  ensureSlugNotUsedByOtherFile(normalized.slug);

  if (fs.existsSync(targetPath)) {
    throw new AuthorPostError(409, "文件名冲突，请修改 slug 或日期");
  }

  const content = serializePostFile(normalized);
  writeAtomically(targetPath, content);

  const stat = fs.statSync(targetPath);

  return {
    slug: normalized.slug,
    fileName,
    lastKnownMtimeMs: stat.mtimeMs,
    warning: null as string | null,
  };
}

export function updateDraft(
  currentSlug: string,
  input: Partial<Omit<AuthorEditablePost, "tags"> & { tags: string[] | string }>
) {
  ensurePostsDir();

  const entry = findPostEntryBySlug(currentSlug);

  if (!entry?.post) {
    throw new AuthorPostError(404, "草稿不存在或已被移动");
  }

  const sourcePath = buildPostFilePath(entry.fileName);
  const sourceStat = readFileStat(sourcePath);

  if (!sourceStat) {
    throw new AuthorPostError(404, "草稿不存在或已被移动");
  }

  const lastKnownMtimeMs = Number(input.lastKnownMtimeMs);
  if (!Number.isFinite(lastKnownMtimeMs)) {
    throw new AuthorPostError(400, "lastKnownMtimeMs 缺失");
  }

  if (Math.abs(sourceStat.mtimeMs - lastKnownMtimeMs) > 1) {
    throw new AuthorPostError(409, "文件已更新，请刷新后重试");
  }

  const currentEditable = getEditablePostBySlug(currentSlug);
  const normalized = validateInput({
    ...currentEditable,
    ...input,
    published: typeof input.published === "boolean" ? input.published : currentEditable.published,
  });

  ensureSlugNotUsedByOtherFile(normalized.slug, entry.fileName);

  const nextFileName = buildPostFileName(normalized.date, normalized.slug);
  const targetPath = buildPostFilePath(nextFileName);
  const targetExists = fs.existsSync(targetPath);

  if (targetPath !== sourcePath && targetExists) {
    throw new AuthorPostError(409, "文件名冲突，请修改 slug 或日期");
  }

  const publishStateChanged = currentEditable.published !== normalized.published;
  const fileNameChanged = nextFileName !== entry.fileName;

  if (publishStateChanged || fileNameChanged) {
    createBackup(sourcePath);
  }

  const content = serializePostFile(normalized);
  writeAtomically(targetPath, content);

  let warning: string | null = null;

  if (targetPath !== sourcePath) {
    try {
      fs.unlinkSync(sourcePath);
    } catch {
      warning = "内容已保存到新文件，但旧文件待人工清理";
    }
  }

  const stat = fs.statSync(targetPath);

  return {
    slug: normalized.slug,
    fileName: nextFileName,
    lastKnownMtimeMs: stat.mtimeMs,
    warning,
    published: normalized.published,
  };
}
