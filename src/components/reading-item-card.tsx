import Link from "next/link";
import type { ReadingItem } from "@/lib/reading-list";
import {
  READING_STATUS_LABELS,
  READING_STATUS_COLORS,
  READING_TYPE_LABELS,
  READING_TYPE_COLORS,
} from "@/lib/reading-list";

interface ReadingItemCardProps {
  item: ReadingItem;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export function ReadingItemCard({ item }: ReadingItemCardProps) {
  return (
    <article className="group rounded-xl border border-border bg-bg-surface p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 duration-200">
      {/* Meta row */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${READING_TYPE_COLORS[item.type]}`}
        >
          {READING_TYPE_LABELS[item.type]}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${READING_STATUS_COLORS[item.status]}`}
        >
          {READING_STATUS_LABELS[item.status]}
        </span>
        <span className="ml-auto">{item.date}</span>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold tracking-tight">
        <Link
          href={`/reading-list/${item.slug}`}
          className="text-text-primary hover:text-accent transition-colors duration-150"
        >
          {item.title}
        </Link>
      </h3>

      {/* Author + source */}
      {(item.author || item.source) && (
        <p className="mb-2 text-sm text-text-secondary">
          {item.author && <span>{item.author}</span>}
          {item.author && item.source && <span> · </span>}
          {item.source && <span className="text-text-muted">{item.source}</span>}
        </p>
      )}

      {/* Rating */}
      {item.rating && (
        <div className="mb-3 text-sm">
          <StarRating rating={item.rating} />
        </div>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tags/${encodeURIComponent(tag)}`}
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs bg-accent-subtle text-accent hover:bg-accent hover:text-white transition-colors duration-150"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
