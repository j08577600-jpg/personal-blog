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
      <div className="mb-8">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">
          文章
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-black/45 dark:text-white/45">
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.readingTime}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-10 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-black/8 px-2.5 py-1 text-xs text-black/55 dark:border-white/10 dark:text-white/55"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Body */}
      <MDXRemote source={post.content} />
    </>
  );
}
