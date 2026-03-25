import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  PostFrontmatterSchema,
  getAllPostEntries,
  parsePostFile,
  POSTS_DIR,
} from "@/lib/posts";
import { slugifyPostValue } from "@/lib/post-slug";

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
  series?: string;
  recommended?: boolean;
  updatedAt?: string;
  updateNote?: string;
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

function normalizeTags(tags: unknown) {
  const source = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
      ? tags.split(",")
      : [];

  return Array.from(
    new Set(
      source
        .map((tag) => String(tag).trim())
        .filter(Boolean)
    )
  );
}

function normalizeCover(cover: unknown) {
  if (typeof cover !== "string") {
    return undefined;
  }

  const trimmed = cover.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
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
    series: normalizeOptionalText(input.series),
    recommended: Boolean(input.recommended),
    updatedAt: normalizeOptionalText(input.updatedAt),
    updateNote: normalizeOptionalText(input.updateNote),
  });

  if (frontmatter.updateNote && !frontmatter.updatedAt) {
    throw new AuthorPostError(400, "填写更新说明时，也需要填写更新日期");
  }

  const {
    cover,
    series,
    recommended,
    updatedAt,
    updateNote,
    ...frontmatterWithoutOptionalFields
  } = frontmatter;

  const serializedFrontmatter = {
    ...frontmatterWithoutOptionalFields,
    ...(cover ? { cover } : {}),
    ...(series ? { series } : {}),
    ...(recommended ? { recommended } : {}),
    ...(updatedAt ? { updatedAt } : {}),
    ...(updateNote ? { updateNote } : {}),
  };

  const content = input.body.replace(/\r\n/g, "\n").trimEnd();
  return `${matter.stringify(content ? `${content}\n` : "", serializedFrontmatter).trimEnd()}\n`;
}

function validateInput(input: Partial<AuthorPostPayload>) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const date = typeof input.date === "string" ? input.date.trim() : getTodayDateString();
  const slugSource = typeof input.slug === "string" ? input.slug.trim() : "";
  const slug = slugifyPostValue(slugSource);
  const excerpt = typeof input.excerpt === "string" ? input.excerpt.trim() : "";
  const published = Boolean(input.published);
  const body = typeof input.body === "string" ? input.body : "";
  const tags = normalizeTags(input.tags);
  const cover = normalizeCover(input.cover);
  const series = normalizeOptionalText(input.series);
  const recommended = Boolean(input.recommended);
  const updatedAt = normalizeOptionalText(input.updatedAt);
  const updateNote = normalizeOptionalText(input.updateNote);

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

  if (updatedAt && !DATE_PATTERN.test(updatedAt)) {
    throw new AuthorPostError(400, "updatedAt 格式须为 yyyy-MM-dd");
  }

  if (updateNote && !updatedAt) {
    throw new AuthorPostError(400, "填写更新说明时，也需要填写更新日期");
  }

  return {
    title,
    date,
    slug,
    excerpt,
    tags,
    cover,
    series,
    recommended,
    updatedAt,
    updateNote,
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
    series: "",
    recommended: false,
    updatedAt: "",
    updateNote: "",
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
    series: parsed.frontmatter.series ?? "",
    recommended: parsed.frontmatter.recommended ?? false,
    updatedAt: parsed.frontmatter.updatedAt ?? "",
    updateNote: parsed.frontmatter.updateNote ?? "",
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
    published: normalized.published,
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
    throw new AuthorPostError(
      409,
      "文件已被其他修改覆盖，需要先刷新或恢复本地内容后再决定保留哪一版"
    );
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
      warning = `slug 或日期已变更，编辑器已切换到 ${nextFileName}`;
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
