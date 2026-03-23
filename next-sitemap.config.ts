import type { IConfig } from "next-sitemap";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.chenjilan.com";

type Changefreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

type SitemapPath = {
  loc: string;
  lastmod: string;
  priority: number;
  changefreq: Changefreq;
};

/** Read post slugs directly from the filesystem — runs in Node context at postbuild */
function getPostPaths(): SitemapPath[] {
  const postsDir = path.join(process.cwd(), "content/posts");
  let files: string[] = [];
  try {
    files = fs.readdirSync(postsDir);
  } catch {
    return [];
  }

  return files
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((fileName) => {
      const fullPath = path.join(postsDir, fileName);
      const raw = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(raw);
      // Only include posts that are published AND have all required frontmatter fields.
      // This mirrors the Zod validation in posts.ts — a post must have
      // title, date, slug, excerpt, and published to be accessible via getPostBySlug().
      if (
        !data.published ||
        !data.slug ||
        !data.title ||
        !data.date ||
        !data.excerpt
      )
        return null;
      const slug = String(data.slug);
      const lastmod = data.date
        ? new Date(String(data.date) + "T00:00:00.000Z").toISOString()
        : new Date().toISOString();
      return {
        loc: `${siteUrl}/blog/${slug}`,
        lastmod,
        priority: 0.8,
        changefreq: "weekly",
      };
    })
    .filter((p): p is SitemapPath => p !== null);
}

/** Extract unique tags from published posts for sitemap inclusion */
function getTagPaths(): SitemapPath[] {
  const postsDir = path.join(process.cwd(), "content/posts");
  let files: string[] = [];
  try {
    files = fs.readdirSync(postsDir);
  } catch {
    return [];
  }

  const tagSet = new Set<string>();
  for (const fileName of files) {
    if (!fileName.endsWith(".mdx") && !fileName.endsWith(".md")) continue;
    const fullPath = path.join(postsDir, fileName);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(raw);
    if (!data.published || !data.slug || !data.title || !data.date || !data.excerpt) continue;
    const tags: string[] = Array.isArray(data.tags) ? data.tags : [];
    for (const tag of tags) {
      tagSet.add(String(tag));
    }
  }

  const now = new Date().toISOString();
  const tagPaths: SitemapPath[] = [{ loc: `${siteUrl}/blog/tags`, changefreq: "weekly", priority: 0.7, lastmod: now }];
  for (const tag of tagSet) {
    tagPaths.push({
      loc: `${siteUrl}/blog/tags/${encodeURIComponent(tag)}`,
      changefreq: "weekly",
      priority: 0.6,
      lastmod: now,
    });
  }
  return tagPaths;
}

const config: IConfig = {
  siteUrl,
  outDir: "./public",
  generateIndexSitemap: false,
  generateRobotsTxt: false,
  changefreq: "weekly",
  priority: 0.7,
  autoLastmod: true,
  exclude: ["/admin", "/admin/*"],
  additionalPaths: async () => {
    const postPaths = getPostPaths();
    const staticPaths: SitemapPath[] = [
      { loc: siteUrl, changefreq: "daily", priority: 1.0, lastmod: new Date().toISOString() },
      { loc: `${siteUrl}/blog`, changefreq: "daily", priority: 0.9, lastmod: new Date().toISOString() },
      { loc: `${siteUrl}/about`, changefreq: "monthly", priority: 0.5, lastmod: new Date().toISOString() },
    ];
    const tagPaths = getTagPaths();
    return [...staticPaths, ...tagPaths, ...postPaths];
  },
};

export default config;
