import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "博客",
  description: "所有文章。记录工程实践、项目进展和值得长期保留的思考。",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const posts = getPosts();

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      {/* Title section with blue accent bar */}
      <div className="relative mb-12 max-w-2xl pl-5">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-full" />
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-text-muted">博客</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          记录构建、交付，以及更认真地思考问题。
        </h1>
        {posts.length > 0 && (
          <p className="mt-3 text-sm text-text-muted">
            共 {posts.length} 篇文章
          </p>
        )}
      </div>

      {/* Post grid */}
      <div className="grid gap-6">
        {posts.length === 0 ? (
          <p className="py-12 text-center text-sm text-text-muted">
            暂无文章，敬请期待。
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.slug} post={post} />)
        )}
      </div>
    </div>
  );
}
