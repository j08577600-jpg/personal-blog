import type { Metadata } from "next";
import { SearchBox } from "@/components/search-box";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索博客中的文章、项目、笔记与阅读记录。",
  alternates: {
    canonical: "/search",
  },
};

type SearchPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialQuery = params?.q ?? "";

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="relative mb-12 max-w-2xl pl-5">
        <span className="absolute bottom-0 left-0 top-0 w-1 rounded-full bg-accent" />
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-text-muted">
          搜索
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          在全站内容里找到你感兴趣的东西。
        </h1>
      </div>

      <SearchBox initialQuery={initialQuery} />
    </div>
  );
}
