"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Fuse from "fuse.js";

interface SearchEntry {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
}

const DEBOUNCE_MS = 300;

function truncateExcerpt(text: string, maxChars = 100) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "…";
}

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null);
  const [loading, setLoading] = useState(true);

  // Load index on mount
  useEffect(() => {
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((data: SearchEntry[]) => {
        setFuse(
          new Fuse(data, {
            keys: ["title", "excerpt", "tags"],
            threshold: 0.3,
            includeScore: true,
          })
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const search = useCallback(
    (q: string) => {
      if (!fuse) return;
      if (!q.trim()) {
        setResults([]);
        return;
      }
      const hits = fuse.search(q);
      setResults(hits.map((h) => h.item));
    },
    [fuse]
  );

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => search(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, search]);

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">加载索引中…</p>
    );
  }

  const hasQuery = query.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <svg
            className="h-4 w-4 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章标题、摘要或标签…"
          autoFocus
          className="w-full rounded-xl border border-border bg-bg-surface py-3.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {/* Results */}
      {!hasQuery && (
        <p className="py-6 text-center text-sm text-text-muted">
          输入关键词开始搜索
        </p>
      )}

      {hasQuery && results.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-text-secondary">未找到相关文章</p>
          <p className="mt-1 text-xs text-text-muted">
            换个关键词试试，或浏览{" "}
            <Link href="/blog" className="text-accent hover:underline">
              全部文章
            </Link>
          </p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="text-xs text-text-muted">
            找到 {results.length} 篇相关文章
          </p>
          <div className="grid gap-5">
            {results.map((post) => (
              <article
                key={post.slug}
                className="group rounded-xl border border-border bg-bg-surface p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 duration-200"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <span>{post.date}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold tracking-tight">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-text-primary hover:text-accent transition-colors duration-150"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mb-3 text-sm leading-6 text-text-secondary">
                  {truncateExcerpt(post.excerpt)}
                </p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs bg-accent-subtle text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
