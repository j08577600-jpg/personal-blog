/**
 * Build-time script: generates public/search-index.json
 * Reuses public content loaders so the search index matches site visibility rules.
 */
import fs from "node:fs";
import path from "node:path";
import { buildSearchIndex } from "../src/lib/search";
import { getPosts } from "../src/lib/posts";
import { getProjects } from "../src/lib/projects";

const OUTPUT_PATH = path.resolve(process.cwd(), "public/search-index.json");

const posts = getPosts();
const projects = getProjects();
const searchIndex = buildSearchIndex(posts, projects);

const publicDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(searchIndex, null, 2), "utf8");
console.log(
  `search-index.json generated: ${posts.length} posts, ${projects.length} projects indexed`
);
