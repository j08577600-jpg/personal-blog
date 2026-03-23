import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览博客文章。",
  alternates: { canonical: "/blog/tags" },
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-12 max-w-2xl">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">标签</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">按标签浏览</h1>
      </div>
      {tags.length === 0 ? (
        <p className="py-12 text-center text-sm text-black/45 dark:text-white/45">暂无标签。</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/blog/tags/${encodeURIComponent(tag)}`}
                className="flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-sm text-black/65 transition hover:border-black/20 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/65 dark:hover:border-white/20"
              >
                <span>{tag}</span>
                <span className="text-xs text-black/35 dark:text-white/35">({count})</span>
              </Link>
            ))}
          </div>
          <div className="mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-black/55 hover:text-black dark:text-white/55 dark:hover:text-white"
            >
              ← 返回博客
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
