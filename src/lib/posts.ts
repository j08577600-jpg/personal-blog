import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

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

function parsePost(fileName: string): Post | null {
  const fullPath = path.join(POSTS_DIR, fileName);
  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    const rt = readingTime(content);

    return {
      slug: data.slug ?? fileName.replace(/\.mdx?$/, ""),
      title: data.title ?? "",
      excerpt: data.excerpt ?? "",
      date: data.date ?? "",
      tags: data.tags ?? [],
      published: data.published ?? false,
      cover: data.cover,
      readingTime: rt.text,
      content,
    };
  } catch {
    return null;
  }
}

export function getPosts(): Post[] {
  try {
    const fileNames = fs.readdirSync(POSTS_DIR);
    const posts = fileNames
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map(parsePost)
      .filter((p): p is Post => p !== null && p.published)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return posts;
  } catch {
    return [];
  }
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fileNames = fs.readdirSync(POSTS_DIR);
    for (const fileName of fileNames) {
      if (!fileName.endsWith(".mdx") && !fileName.endsWith(".md")) continue;
      const fullPath = path.join(POSTS_DIR, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      // 用 frontmatter 中的 slug 匹配，不依赖文件名
      if ((data.slug as string) === slug) {
        const rt = readingTime(content);
        return {
          slug: data.slug as string,
          title: data.title ?? "",
          excerpt: data.excerpt ?? "",
          date: data.date ?? "",
          tags: data.tags ?? [],
          published: data.published ?? false,
          cover: data.cover,
          readingTime: rt.text,
          content,
        };
      }
    }
  } catch {}
  return null;
}
