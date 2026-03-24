import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

// ---------------------------------------------------------------------------
// Project type
// ---------------------------------------------------------------------------

export type Project = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
  content: string;
  published: boolean;
  status?: "active" | "completed" | "archived";
  featured?: boolean;
  links?: {
    github?: string;
    live?: string;
    demo?: string;
  };
  tech?: string[];
};

// ---------------------------------------------------------------------------
// Project status
// ---------------------------------------------------------------------------

export type ProjectStatus = "active" | "completed" | "archived";

export const PROJECT_STATUS_OPTIONS: ProjectStatus[] = [
  "active",
  "completed",
  "archived",
];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "进行中",
  completed: "已完成",
  archived: "归档",
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  archived: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const PROJECTS_DIR = path.join(process.cwd(), "content/projects");

interface ParsedProject {
  project: Project;
  rawData: Record<string, unknown>;
  content: string;
}

function parseProject(fileName: string): ParsedProject | null {
  const fullPath = path.join(PROJECTS_DIR, fileName);
  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    const rawData = data as Record<string, unknown>;

    const slug = rawData.slug as string | undefined;
    const title = rawData.title as string | undefined;
    const excerpt = rawData.excerpt as string | undefined;
    const date = rawData.date as string | undefined;

    if (!slug || !title || !excerpt || !date) {
      return null;
    }

    const rt = readingTime(content);

    const project: Project = {
      slug,
      title,
      excerpt,
      date,
      readingTime: rt.text,
      tags: (rawData.tags as string[]) ?? [],
      published: (rawData.published as boolean) ?? false,
      status: rawData.status as Project["status"],
      featured: rawData.featured as boolean | undefined,
      links: rawData.links as Project["links"],
      tech: (rawData.tech as string[]) ?? rawData.tags as string[] | undefined,
      content,
    };

    return { project, rawData, content };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns only published projects sorted: featured first, then by date desc.
 */
export function getProjects(): Project[] {
  try {
    const fileNames = fs.readdirSync(PROJECTS_DIR);
    return fileNames
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map((f) => parseProject(f))
      .filter((r): r is ParsedProject => r !== null && r.project.published)
      .map((r) => r.project)
      .sort((a, b) => {
        // featured first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // then by date desc
        return a.date < b.date ? 1 : -1;
      });
  } catch {
    return [];
  }
}

/**
 * Returns a single project by slug. Returns null if not found or not published.
 */
export function getProjectBySlug(slug: string): Project | null {
  try {
    const fileNames = fs.readdirSync(PROJECTS_DIR);
    for (const fileName of fileNames) {
      if (!fileName.endsWith(".mdx") && !fileName.endsWith(".md")) continue;
      const parsed = parseProject(fileName);
      if (parsed && parsed.project.slug === slug) return parsed.project;
    }
  } catch {}
  return null;
}

/**
 * Returns featured projects.
 */
export function getFeaturedProjects(): Project[] {
  return getProjects().filter((p) => p.featured);
}

/**
 * Returns all unique tags from published projects, with count.
 */
export type TagEntry = {
  tag: string;
  count: number;
};

export function getAllProjectTags(): TagEntry[] {
  const projects = getProjects();
  const counts: Record<string, number> = {};
  for (const project of projects) {
    for (const tag of project.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
