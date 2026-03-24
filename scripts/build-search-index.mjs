/**
 * Build-time script: generates public/search-index.json
 * Reads all published MDX posts and outputs an array of search entries.
 * Run automatically via `npm run build` (prebuild hook).
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Resolve content directory relative to project root
const CONTENT_DIR = path.resolve(process.cwd(), "content/posts");
const OUTPUT_PATH = path.resolve(process.cwd(), "public/search-index.json");

function getPublishedPosts() {
  try {
    const fileNames = fs.readdirSync(CONTENT_DIR);
    return fileNames
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map((fileName) => {
        const fullPath = path.join(CONTENT_DIR, fileName);
        const raw = fs.readFileSync(fullPath, "utf8");
        const { data } = matter(raw);
        // Only include published posts
        if (data.published !== true) return null;
        return {
          slug: String(data.slug ?? ""),
          title: String(data.title ?? ""),
          excerpt: String(data.excerpt ?? ""),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          date: String(data.date ?? ""),
        };
      })
      .filter((item) => item !== null && item.slug !== "");
  } catch {
    return [];
  }
}

const posts = getPublishedPosts();

// Ensure public/ directory exists
const publicDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(posts, null, 2), "utf8");
console.log(`✅ search-index.json generated — ${posts.length} posts indexed`);
