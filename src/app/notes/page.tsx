import type { Metadata } from "next";
import { NoteCard } from "@/components/note-card";
import { getNotes } from "@/lib/notes";

export const metadata: Metadata = {
  title: "碎片笔记",
  description: "短小的思考碎片。不成文，但有价值。",
  alternates: {
    canonical: "/notes",
  },
};

export default function NotesPage() {
  const notes = getNotes();

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      {/* Title */}
      <div className="relative mb-12 max-w-2xl pl-5">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-full" />
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-text-muted">
          碎片笔记
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          短小的思考碎片。不成文，但有价值。
        </h1>
        {notes.length > 0 && (
          <p className="mt-3 text-sm text-text-muted">
            共 {notes.length} 条笔记
          </p>
        )}
      </div>

      {/* Notes list */}
      <div className="grid gap-3">
        {notes.length === 0 ? (
          <p className="py-12 text-center text-sm text-text-muted">
            暂无笔记，敬请期待。
          </p>
        ) : (
          notes.map((note) => <NoteCard key={note.slug} note={note} />)
        )}
      </div>
    </div>
  );
}
