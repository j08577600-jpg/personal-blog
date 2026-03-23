import { MDXRemote } from "next-mdx-remote/rsc";
import type { Post } from "@/lib/posts";

interface ArticleRendererProps {
  post: Post;
}

/**
 * Shared article body renderer.
 * Used by both the public /blog/[slug] page and the protected
 * /dashboard/preview/[slug] page to ensure identical rendering.
 * Does NOT include a back-link — callers decide their own navigation.
 */
export default function ArticleRenderer({ post }: ArticleRendererProps) {
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-5 mb-8 h-px bg-border" />
      </div>

      {/* Tags (above date) */}
      <div className="mb-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs bg-accent-subtle text-accent"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Date + reading time */}
      <div className="mb-10 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        <span>{post.date}</span>
        <span>·</span>
        <span>{post.readingTime} 分钟阅读</span>
      </div>

      {/* Body — use @tailwindcss/typography prose */}
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
        <MDXRemote source={post.content} />
      </div>
    </>
  );
}
