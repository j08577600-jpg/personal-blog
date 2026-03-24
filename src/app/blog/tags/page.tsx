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
    <div className="mx-auto max-w-4xl px-6 py-20">
      {/* Title section with blue accent bar */}
      <div className="relative mb-12 max-w-2xl pl-5">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-full" />
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-text-muted">标签</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          按标签浏览
        </h1>
      </div>

      {tags.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-muted">暂无标签。</p>
      ) : (
        <>
          {/* Tag grid cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/blog/tags/${encodeURIComponent(tag)}`}
                className="group rounded-xl bg-bg-surface p-4 shadow-sm transition hover:shadow-md"
              >
                <span className="block text-sm font-medium text-accent group-hover:underline">
                  {tag}
                </span>
                <span className="mt-1 block text-xs text-text-muted">
                  {count} 篇
                </span>
              </Link>
            ))}
          </div>

          {/* Back link */}
          <div className="mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline transition-colors duration-150"
            >
              ← 返回博客
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
