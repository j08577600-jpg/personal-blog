import Link from "next/link";
import { requireAuthorPageSession } from "@/lib/auth";
import { getAllPostEntries } from "@/lib/posts";

export default async function WriteWorkbenchPage() {
  await requireAuthorPageSession();
  const entries = getAllPostEntries().filter((entry) => entry.post);
  const recentEntries = [...entries].sort((a, b) => (a.post?.date ?? "") < (b.post?.date ?? "") ? 1 : -1).slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-text-muted">在线写作工作台 V2</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">作者写作入口</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
            先继续最近的草稿，再决定是否新建。所有内容仍然直接写入文件系统，但现在有更清楚的保存与恢复保护。
          </p>
        </div>
        <Link
          href="/dashboard/write/new"
          className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          新建草稿
        </Link>
      </div>

      <section className="mb-8 rounded-3xl border border-border bg-bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-text-primary">继续写作</p>
            <p className="mt-2 text-sm leading-7 text-text-secondary">
              默认展示最近编辑的内容。你最可能想做的事，不该埋在文件列表里。
            </p>
          </div>
          <p className="text-xs text-text-muted">最近 3 篇</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {recentEntries.length > 0 ? (
            recentEntries.map((entry) => (
              <Link
                key={entry.fileName}
                href={`/dashboard/write/${entry.post?.slug}`}
                className="rounded-2xl border border-border bg-bg-subtle/60 p-4 transition hover:border-accent"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="line-clamp-2 font-medium text-text-primary">{entry.post?.title}</p>
                    <p className="mt-2 text-xs text-text-muted">{entry.fileName}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      entry.post?.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {entry.post?.published ? "已发布" : "草稿"}
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs text-text-secondary">
                  <span>{entry.post?.date}</span>
                  <span>{entry.post?.published ? "继续更新" : "继续编辑"} →</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-text-muted md:col-span-3">
              还没有可继续的文章，先创建第一篇草稿。
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4">
        {entries.map((entry) => (
          <Link
            key={entry.fileName}
            href={`/dashboard/write/${entry.post?.slug}`}
            className="rounded-2xl border border-border bg-bg-surface p-5 shadow-sm transition hover:border-accent"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-medium text-text-primary">{entry.post?.title}</p>
                <p className="mt-1 text-sm text-text-muted">{entry.fileName}</p>
              </div>
              <div className="text-right text-sm text-text-secondary">
                <p>{entry.post?.published ? "已发布" : "草稿"}</p>
                <p className="mt-1">{entry.post?.date}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
