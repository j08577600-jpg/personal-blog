#!/usr/bin/env npx tsx
/**
 * scripts/generate-feed.ts
 *
 * Generates public/feed.xml — a valid RSS 2.0 Feed — from all published posts.
 * Run during postbuild: npx tsx scripts/generate-feed.ts
 *
 * Note: uses tsx to support TypeScript imports and @/ alias.
 */

import fs from "fs";
import path from "path";
import { getPosts } from "../src/lib/posts";

// ---------------------------------------------------------------------------
// Site URL — must match the one used in sitemap generation
// ---------------------------------------------------------------------------
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://blog.chenjilan.com";
const SITE_NAME = "jay / 个人博客";
const SITE_DESCRIPTION =
  "极简技术博客，记录工程实践、项目进展和 Agent 工作流。";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Convert yyyy-MM-dd to RFC 822 date string for RSS <pubDate>.
 * e.g. "2026-03-23" → "Mon, 23 Mar 2026 00:00:00 GMT"
 */
function toRfc822(dateStr: string): string {
  return new Date(dateStr + "T00:00:00.000Z").toUTCString();
}

// ---------------------------------------------------------------------------
// Feed generation
// ---------------------------------------------------------------------------

function generateFeed(): void {
  const posts = getPosts();
  const buildDate = new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const categories = post.tags
        .map((t) => `    <category>${escapeXml(t)}</category>`)
        .join("\n");
      return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${toRfc822(post.date)}</pubDate>
    <description>${escapeXml(post.excerpt)}</description>
${categories}
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  const outPath = path.join(process.cwd(), "public", "feed.xml");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, xml, "utf8");

  console.log(
    `✅ feed.xml generated: ${posts.length} posts → ${outPath}`
  );
}

generateFeed();
