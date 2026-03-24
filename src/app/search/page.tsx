import type { Metadata } from "next";
import { SearchBox } from "@/components/search-box";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索博客文章。",
  alternates: {
    canonical: "/search",
  },
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      {/* Title */}
      <div className="relative mb-12 max-w-2xl pl-5">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-full" />
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-text-muted">
          搜索
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          找到你感兴趣的内容。
        </h1>
      </div>

      <SearchBox />
    </div>
  );
}
