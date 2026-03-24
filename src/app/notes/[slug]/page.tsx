import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getNoteBySlug, getAllNoteSlugs } from "@/lib/notes";
import { siteConfig } from "@/lib/site";
import { MDXRemote } from "next-mdx-remote/rsc";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllNoteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = getNoteBySlug(slug);

  if (!note) {
    return { title: "笔记未找到" };
  }

  const url = `${siteConfig.siteUrl}/notes/${note.slug}`;

  return {
    title: note.title,
    description: note.title,
    authors: [{ name: siteConfig.author.name }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: note.title,
      tags: note.tags,
    },
    twitter: {
      card: "summary",
      title: note.title,
    },
  };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <Link
        href="/notes"
        className="mb-8 inline-block text-sm text-accent hover:underline transition-colors duration-150"
      >
        ← 返回笔记
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          {note.title}
        </h1>
        <div className="mt-5 mb-8 h-px bg-border" />
      </div>

      {/* Date + reading time */}
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        <span>{note.date}</span>
        {note.readingTime && <><span>·</span><span>{note.readingTime} 分钟阅读</span></>}
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tags/${encodeURIComponent(tag)}`}
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs bg-accent-subtle text-accent hover:bg-accent hover:text-white transition-colors duration-150"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="prose prose-lg dark:prose-invert max-w-none
        prose-headings:text-text-primary
        prose-p:text-text-secondary
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-code:text-accent prose-code:bg-accent-subtle prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-normal
        prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800 prose-pre:rounded-xl prose-pre:p-5
        prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-accent-subtle/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r prose-blockquote:not-italic
        prose-strong:text-text-primary
        prose-li:text-text-secondary
        prose-hr:border-border
        prose-img:rounded-xl
        prose-table:text-text-secondary
        prose-th:text-text-primary
        prose-em:text-text-secondary
      ">
        <MDXRemote source={note.content} />
      </div>
    </article>
  );
}
