import Link from "next/link";
import type { Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group rounded-xl border border-border bg-bg-surface p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 duration-200">
      {/* Meta */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <span>{post.date}</span>
        <span>·</span>
        <span>{post.readingTime} 分钟阅读</span>
      </div>

      {/* Title */}
      <h3 className="mb-3 text-xl font-semibold tracking-tight">
        <Link
          href={`/blog/${post.slug}`}
          className="text-text-primary hover:text-accent transition-colors duration-150"
        >
          {post.title}
        </Link>
      </h3>

      {/* Excerpt */}
      <p className="mb-4 text-sm leading-7 text-text-secondary">
        {post.excerpt}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/blog/tags/${encodeURIComponent(tag)}`}
            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs bg-accent-subtle text-accent hover:bg-accent hover:text-white transition-colors duration-150"
          >
            {tag}
          </Link>
        ))}
      </div>
    </article>
  );
}
