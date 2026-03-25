"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import type { SearchEntry } from "@/lib/search";
import { normalizeSearchQuery } from "@/lib/search";

const DEBOUNCE_MS = 300;

function truncateExcerpt(text: string, maxChars = 100) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "…";
}

type SearchBoxProps = {
  initialQuery?: string;
};

export function SearchBox({ initialQuery = "" }: SearchBoxProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const lastSyncedUrlQueryRef = useRef(initialQuery);

  const urlQuery = useMemo(() => searchParams.get("q") ?? "", [searchParams]);

  useEffect(() => {
    let cancelled = false;

    fetch("/search-index.json")
      .then((response) => response.json())
      .then((data: SearchEntry[]) => {
        if (cancelled) return;
        setFuse(
          new Fuse(data, {
            keys: [
              { name: "title", weight: 0.5 },
              { name: "tags", weight: 0.3 },
              { name: "excerpt", weight: 0.15 },
              { name: "searchText", weight: 0.05 },
            ],
            threshold: 0.22,
            ignoreLocation: true,
            includeScore: true,
            minMatchCharLength: 1,
          })
        );
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    if (!fuse) return [];

    const normalizedQuery = normalizeSearchQuery(query);
    if (!normalizedQuery) return [];

    return fuse.search(normalizedQuery).map((hit) => hit.item);
  }, [fuse, query]);

  useEffect(() => {
    if (urlQuery === lastSyncedUrlQueryRef.current) return;

    lastSyncedUrlQueryRef.current = urlQuery;
    const syncTimer = window.setTimeout(() => {
      setQuery(urlQuery);
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [urlQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextQuery = query.trim();
      const currentQuery = urlQuery.trim();
      if (nextQuery === currentQuery) return;

      const params = new URLSearchParams(searchParams.toString());
      if (nextQuery) {
        params.set("q", nextQuery);
      } else {
        params.delete("q");
      }

      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      lastSyncedUrlQueryRef.current = nextQuery;
      window.history.pushState(null, "", nextUrl);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [pathname, query, searchParams, urlQuery]);

  if (loading) {
    return <p className="py-8 text-center text-sm text-text-muted">加载索引中…</p>;
  }

  const hasQuery = normalizeSearchQuery(query).length > 0;

  return (
    <div className="space-y-6">
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
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索文章、项目、标签或关键词…"
          autoFocus
          className="w-full rounded-xl border border-border bg-bg-surface py-3.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {!hasQuery && (
        <p className="py-6 text-center text-sm text-text-muted">
          输入关键词开始搜索文章和项目
        </p>
      )}

      {hasQuery && results.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-text-secondary">未找到相关内容</p>
          <p className="mt-1 text-xs text-text-muted">
            换个关键词试试，或浏览
            <Link href="/blog" className="ml-1 text-accent hover:underline">
              文章
            </Link>
            与
            <Link href="/projects" className="ml-1 text-accent hover:underline">
              项目
            </Link>
          </p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="text-xs text-text-muted">找到 {results.length} 条相关内容</p>
          <div className="grid gap-5">
            {results.map((entry) => (
              <article
                key={`${entry.type}:${entry.slug}`}
                className="group rounded-xl border border-border bg-bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <span className="rounded-full bg-accent-subtle px-2.5 py-0.5 text-accent">
                    {entry.section}
                  </span>
                  <span>{entry.date}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold tracking-tight">
                  <Link
                    href={entry.href}
                    className="text-text-primary transition-colors duration-150 hover:text-accent"
                  >
                    {entry.title}
                  </Link>
                </h3>
                <p className="mb-3 text-sm leading-6 text-text-secondary">
                  {truncateExcerpt(entry.excerpt)}
                </p>
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-accent-subtle px-2.5 py-0.5 text-xs text-accent"
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
