import Link from "next/link";
import { requireAuthorPageSession } from "@/lib/auth";
import { getAllPostEntries } from "@/lib/posts";

export default async function WriteWorkbenchPage() {
  await requireAuthorPageSession();
  const entries = getAllPostEntries().filter((entry) => entry.post);

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-text-muted">在线写作工作台 V2</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">作者写作入口</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
            在这里创建草稿、继续编辑已有文章，保存后再去预览或发布。所有内容仍然直接写入文件系统。
          </p>
        </div>
        <Link
          href="/dashboard/write/new"
          className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          新建草稿
        </Link>
      </div>

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
