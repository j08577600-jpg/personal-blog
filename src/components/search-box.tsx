"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import type { SearchEntry, SearchEntryType } from "@/lib/search";
import {
  getAvailableSearchTags,
  normalizeSearchQuery,
  SEARCH_TYPE_LABELS,
} from "@/lib/search";

const DEBOUNCE_MS = 300;
const ALL_TYPES = "all";

type SearchTypeFilter = SearchEntryType | typeof ALL_TYPES;

function truncateExcerpt(text: string, maxChars = 100) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "…";
}

function SearchFilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active
        ? "rounded-full border border-accent bg-accent-subtle px-3 py-1.5 text-xs font-medium text-accent"
        : "rounded-full border border-border bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-muted transition hover:border-accent/40 hover:text-accent"
      }
    >
      {label}
    </button>
  );
}

type SearchBoxProps = {
  initialQuery?: string;
};

export function SearchBox({ initialQuery = "" }: SearchBoxProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<SearchTypeFilter>(ALL_TYPES);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const lastSyncedUrlQueryRef = useRef(initialQuery);

  const urlQuery = useMemo(() => searchParams.get("q") ?? "", [searchParams]);

  useEffect(() => {
    let cancelled = false;

    fetch("/search-index.json")
      .then((response) => response.json())
      .then((data: SearchEntry[]) => {
        if (cancelled) return;
        setEntries(data);
        setFuse(
          new Fuse(data, {
            keys: [
              { name: "title", weight: 0.5 },
              { name: "tags", weight: 0.2 },
              { name: "excerpt", weight: 0.2 },
              { name: "searchText", weight: 0.1 },
            ],
            threshold: 0.28,
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

  const baseResults = useMemo(() => {
    const normalizedQuery = normalizeSearchQuery(query);
    if (!normalizedQuery) return [] as SearchEntry[];
    if (!fuse) return [] as SearchEntry[];
    return fuse.search(normalizedQuery).map((hit) => hit.item);
  }, [fuse, query]);

  const typeCounts = useMemo(() => {
    return baseResults.reduce<Record<SearchEntryType, number>>((acc, entry) => {
      acc[entry.type] = (acc[entry.type] ?? 0) + 1;
      return acc;
    }, { post: 0, project: 0, note: 0, reading: 0 });
  }, [baseResults]);

  const availableTags = useMemo(() => getAvailableSearchTags(baseResults).slice(0, 12), [baseResults]);
  const effectiveActiveTag = activeTag && availableTags.includes(activeTag) ? activeTag : null;

  const results = useMemo(() => {
    return baseResults.filter((entry) => {
      if (activeType !== ALL_TYPES && entry.type !== activeType) {
        return false;
      }

      if (effectiveActiveTag && !entry.tags.includes(effectiveActiveTag)) {
        return false;
      }

      return true;
    });
  }, [activeType, baseResults, effectiveActiveTag]);

  useEffect(() => {
    if (urlQuery === lastSyncedUrlQueryRef.current) return;

    lastSyncedUrlQueryRef.current = urlQuery;
    const syncTimer = window.setTimeout(() => {
      setQuery(urlQuery);
      setActiveType(ALL_TYPES);
      setActiveTag(null);
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
          placeholder="搜索文章、项目、笔记、阅读、标签或关键词…"
          autoFocus
          className="w-full rounded-xl border border-border bg-bg-surface py-3.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {!hasQuery && (
        <div className="rounded-2xl border border-dashed border-border bg-bg-surface/70 p-6 text-sm text-text-muted">
          <p className="font-medium text-text-secondary">可搜索范围</p>
          <p className="mt-2">文章、项目、笔记、阅读记录；支持关键词、类型与标签轻筛选。</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {[
              "Next.js",
              "Agent",
              "产品",
              "战略",
            ].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setQuery(sample)}
                className="rounded-full border border-border px-3 py-1.5 transition hover:border-accent/40 hover:text-accent"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasQuery && baseResults.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-border bg-bg-surface p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <SearchFilterChip
              active={activeType === ALL_TYPES}
              label={`全部 ${baseResults.length}`}
              onClick={() => setActiveType(ALL_TYPES)}
            />
            {(Object.keys(SEARCH_TYPE_LABELS) as SearchEntryType[]).map((type) => {
              const count = typeCounts[type];
              if (!count) return null;
              return (
                <SearchFilterChip
                  key={type}
                  active={activeType === type}
                  label={`${SEARCH_TYPE_LABELS[type]} ${count}`}
                  onClick={() => setActiveType(type)}
                />
              );
            })}
          </div>

          {availableTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-muted">相关标签</span>
              {availableTags.map((tag) => (
                <SearchFilterChip
                  key={tag}
                  active={effectiveActiveTag === tag}
                  label={tag}
                  onClick={() => setActiveTag((current) => (current === tag ? null : tag))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {hasQuery && results.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-text-secondary">未找到相关内容</p>
          <p className="mt-1 text-xs text-text-muted">
            换个关键词试试，或浏览
            <Link href="/blog" className="ml-1 text-accent hover:underline">
              文章
            </Link>
            、
            <Link href="/projects" className="ml-1 text-accent hover:underline">
              项目
            </Link>
            、
            <Link href="/notes" className="ml-1 text-accent hover:underline">
              笔记
            </Link>
            和
            <Link href="/reading-list" className="ml-1 text-accent hover:underline">
              阅读
            </Link>
          </p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="text-xs text-text-muted">
            找到 {results.length} 条相关内容
            {activeType !== ALL_TYPES ? ` · 已筛选${SEARCH_TYPE_LABELS[activeType]}` : ""}
            {effectiveActiveTag ? ` · 标签 ${effectiveActiveTag}` : ""}
          </p>
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
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setActiveTag(tag)}
                        className="inline-flex items-center rounded-full bg-accent-subtle px-2.5 py-0.5 text-xs text-accent transition hover:bg-accent hover:text-white"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}

      {hasQuery && entries.length > 0 && baseResults.length === 0 && (
        <p className="text-xs text-center text-text-muted">索引已加载，但当前关键词没有命中公开内容。</p>
      )}
    </div>
  );
}
