/**
 * Build-time script: generates public/search-index.json
 * Reuses public content loaders so the search index matches site visibility rules.
 */
import fs from "node:fs";
import path from "node:path";
import { buildSearchIndex } from "../src/lib/search";
import { getPublicPostsMeta } from "../src/lib/posts";
import { getPublicProjectsMeta } from "../src/lib/projects";
import { getPublicNotesMeta } from "../src/lib/notes";
import { getPublicReadingItemsMeta } from "../src/lib/reading-list";

const OUTPUT_PATH = path.resolve(process.cwd(), "public/search-index.json");

const posts = getPublicPostsMeta();
const projects = getPublicProjectsMeta();
const notes = getPublicNotesMeta();
const readingItems = getPublicReadingItemsMeta();
const searchIndex = buildSearchIndex(posts, projects, notes, readingItems);

const publicDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(searchIndex, null, 2), "utf8");
console.log(
  `search-index.json generated: ${posts.length} posts, ${projects.length} projects, ${notes.length} notes, ${readingItems.length} reading items indexed`
);
