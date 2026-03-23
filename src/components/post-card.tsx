import Link from "next/link";
import type { Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group rounded-2xl border border-black/6 bg-white p-6 transition hover:border-black/12 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-black/45 dark:text-white/45">
        <span>{post.date}</span>
        <span>•</span>
        <span>{post.readingTime}</span>
      </div>
      <h3 className="mb-3 text-xl font-semibold tracking-tight">
        <Link href={`/blog/${post.slug}`} className="group-hover:opacity-80">
          {post.title}
        </Link>
      </h3>
      <p className="mb-4 text-sm leading-7 text-black/65 dark:text-white/65">{post.excerpt}</p>
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/blog/tags/${encodeURIComponent(tag)}`}
            className="rounded-full border border-black/8 px-2.5 py-1 text-xs text-black/55 transition hover:border-black/20 dark:border-white/10 dark:text-white/55 dark:hover:border-white/20"
          >
            {tag}
          </Link>
        ))}
      </div>
    </article>
  );
}
