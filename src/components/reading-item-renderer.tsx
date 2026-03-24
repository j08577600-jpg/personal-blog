import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ReadingItem } from "@/lib/reading-list";
import {
  READING_STATUS_LABELS,
  READING_STATUS_COLORS,
  READING_TYPE_LABELS,
  READING_TYPE_COLORS,
} from "@/lib/reading-list";

interface ReadingItemRendererProps {
  item: ReadingItem;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-xl">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block ml-1 -mt-0.5 opacity-60"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function ReadingItemRenderer({ item }: ReadingItemRendererProps) {
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          {item.title}
        </h1>
        <div className="mt-5 mb-8 h-px bg-border" />
      </div>

      {/* Badges row */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${READING_TYPE_COLORS[item.type]}`}
        >
          {READING_TYPE_LABELS[item.type]}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${READING_STATUS_COLORS[item.status]}`}
        >
          {READING_STATUS_LABELS[item.status]}
        </span>
        {item.rating && (
          <span className="ml-2">
            <StarRating rating={item.rating} />
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="mb-8 flex flex-col gap-2 text-sm text-text-secondary">
        {item.author && (
          <div>
            <span className="text-text-muted">作者：</span>
            {item.author}
          </div>
        )}
        {item.source && (
          <div>
            <span className="text-text-muted">来源：</span>
            {item.source}
          </div>
        )}
        {item.url && (
          <div>
            <span className="text-text-muted">链接：</span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline inline-flex items-center"
            >
              {item.url}
              <ExternalLinkIcon />
            </a>
          </div>
        )}
        <div className="text-text-muted">
          {item.date}
          {item.readingTime && <> · {item.readingTime} 分钟阅读</>}
        </div>
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tags/${encodeURIComponent(tag)}`}
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs bg-accent-subtle text-accent hover:bg-accent hover:text-white transition-colors duration-150"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="prose prose-lg dark:prose-invert max-w-none
        prose-headings:text-text-primary
        prose-p:text-text-secondary
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-code:text-accent prose-code:bg-accent-subtle prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-normal
        prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800 prose-pre:rounded-xl prose-pre:p-5
        prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-accent-subtle/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r prose-blockquote:not-italic
        prose-strong:text-text-primary
        prose-li:text-text-secondary
        prose-hr:border-border
        prose-img:rounded-xl
        prose-table:text-text-secondary
        prose-th:text-text-primary
        prose-em:text-text-secondary
      ">
        <MDXRemote source={item.content} />
      </div>
    </>
  );
}
