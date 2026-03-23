import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "标签",
  description: "按主题浏览所有文章。",
  alternates: { canonical: "/tags" },
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-12 max-w-2xl">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">标签</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">按主题浏览</h1>
      </div>

      {tags.length === 0 ? (
        <p className="py-12 text-center text-sm text-black/45 dark:text-white/45">暂无标签。</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-sm text-black/70 transition hover:border-black/20 hover:bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.02] dark:text-white/70 dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
            >
              <span>{tag}</span>
              <span className="text-xs text-black/38 dark:text-white/38">{count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
