import type { Metadata } from "next";
import { ReadingItemCard } from "@/components/reading-item-card";
import { getReadingList } from "@/lib/reading-list";

export const metadata: Metadata = {
  title: "阅读清单",
  description: "记录读过的书、文章、视频，以及想读、在读的书单。",
  alternates: {
    canonical: "/reading-list",
  },
};

export default function ReadingListPage() {
  const groups = getReadingList();

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      {/* Title */}
      <div className="relative mb-12 max-w-2xl pl-5">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-full" />
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-text-muted">
          阅读清单
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          读过的书、在读的书、想读的书。
        </h1>
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-muted">
          暂无阅读记录，敬请期待。
        </p>
      ) : (
        <div className="space-y-14">
          {groups.map((group) => (
            <section key={group.status}>
              {/* Group header */}
              <div className="mb-6 flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                  {group.label}
                </h2>
                <span className="text-sm text-text-muted">
                  ({group.items.length})
                </span>
              </div>
              {/* Cards grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {group.items.map((item) => (
                  <ReadingItemCard key={item.slug} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
