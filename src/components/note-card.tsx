import Link from "next/link";
import type { Note } from "@/lib/notes";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <article className="group rounded-lg border border-border bg-bg-surface px-5 py-4 shadow-sm transition hover:border-accent/40 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="mb-1.5 text-base font-medium leading-snug text-text-primary">
            <Link
              href={`/notes/${note.slug}`}
              className="hover:text-accent transition-colors duration-150"
            >
              {note.title}
            </Link>
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <span>{note.date}</span>
            {note.readingTime && <><span>·</span><span>{note.readingTime} 分钟阅读</span></>}
          </div>
        </div>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tags/${encodeURIComponent(tag)}`}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-accent-subtle text-accent hover:bg-accent hover:text-white transition-colors duration-150"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
