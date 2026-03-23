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
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-12 max-w-2xl">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">博客</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">记录构建、交付，以及更认真地思考问题。</h1>
      </div>
      <div className="grid gap-5">
        {posts.length === 0 ? (
          <p className="py-12 text-center text-sm text-black/45 dark:text-white/45">
            暂无文章。
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.slug} post={post} />)
        )}
      </div>
    </div>
  );
}
