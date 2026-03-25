import Link from "next/link";
import type { Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group rounded-xl border border-border bg-bg-surface p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <span>{post.date}</span>
        <span>·</span>
        <span>{post.readingTime} 分钟阅读</span>
        {post.recommended ? (
          <span className="rounded-full bg-accent-subtle px-2.5 py-1 font-medium text-accent">
            推荐
          </span>
        ) : null}
        {post.series ? (
          <span className="rounded-full bg-bg-subtle px-2.5 py-1 font-medium text-text-secondary">
            系列 · {post.series}
          </span>
        ) : null}
        {post.updatedAt ? (
          <span className="rounded-full bg-bg-subtle px-2.5 py-1 font-medium text-text-secondary">
            更新于 {post.updatedAt}
          </span>
        ) : null}
      </div>

      <h3 className="mb-3 text-xl font-semibold tracking-tight">
        <Link
          href={`/blog/${post.slug}`}
          className="text-text-primary transition-colors duration-150 hover:text-accent"
        >
          {post.title}
        </Link>
      </h3>

      <p className="mb-4 text-sm leading-7 text-text-secondary">{post.excerpt}</p>

      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/blog/tags/${encodeURIComponent(tag)}`}
            className="inline-flex items-center rounded-full bg-accent-subtle px-2.5 py-1 text-xs text-accent transition-colors duration-150 hover:bg-accent hover:text-white"
          >
            {tag}
          </Link>
        ))}
      </div>
    </article>
  );
}
