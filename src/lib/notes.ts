import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Note = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
  published: boolean;
  readingTime: string;
};

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const NOTES_DIR = path.join(process.cwd(), "content/notes");

function parseNote(fileName: string): Note | null {
  const fullPath = path.join(NOTES_DIR, fileName);
  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const slug = data.slug as string | undefined;
    const title = data.title as string | undefined;
    const date = data.date as string | undefined;

    if (!slug || !title || !date) return null;

    const rt = readingTime(content);

    return {
      slug,
      title,
      date,
      tags: (data.tags as string[]) ?? [],
      content,
      published: (data.published as boolean) ?? false,
      readingTime: rt.text,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns published notes sorted by date descending.
 */
export function getNotes(): Note[] {
  try {
    const fileNames = fs.readdirSync(NOTES_DIR);
    return fileNames
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map(parseNote)
      .filter((r): r is Note => r !== null && r.published)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch {
    return [];
  }
}

/**
 * Returns a single note by slug, or null if not found/not published.
 */
export function getNoteBySlug(slug: string): Note | null {
  try {
    const fileNames = fs.readdirSync(NOTES_DIR);
    for (const fileName of fileNames) {
      if (!fileName.endsWith(".mdx") && !fileName.endsWith(".md")) continue;
      const note = parseNote(fileName);
      if (note && note.slug === slug) return note;
    }
  } catch {}
  return null;
}

/**
 * Returns the most recent n published notes.
 */
export function getRecentNotes(n: number = 3): Note[] {
  return getNotes().slice(0, n);
}

/**
 * Returns all note slugs for static generation.
 */
export function getAllNoteSlugs(): string[] {
  try {
    const fileNames = fs.readdirSync(NOTES_DIR);
    return fileNames
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map(parseNote)
      .filter((r): r is Note => r !== null && r.published)
      .map((r) => r.slug);
  } catch {
    return [];
  }
}
