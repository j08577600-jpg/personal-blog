import Link from "next/link";
import { requireAuthorPageSession } from "@/lib/auth";
import { getAllPostEntries, type PostStatus } from "@/lib/posts";

const providerLabels: Record<string, string> = {
  github: "GitHub",
  google: "Google",
  "azure-ad": "Microsoft",
};

export default async function DashboardPage() {
  const session = await requireAuthorPageSession();
  const entries = getAllPostEntries();

  const published = entries.filter((entry) => entry.status === "published");
  const drafts = entries.filter((entry) => entry.status === "draft");
  const invalid = entries.filter((entry) => entry.status === "invalid");
  const providerLabel = session.user?.provider ? (providerLabels[session.user.provider] ?? session.user.provider) : "未提供";

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="relative mb-12 max-w-3xl pl-5">
        <span className="absolute bottom-0 left-0 top-0 w-1 rounded-full bg-accent" />
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-text-muted">作者控制台</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          内容工作台{session.user?.name ? `，${session.user.name}` : ""}
        </h1>
        <p className="mt-4 text-base leading-8 text-text-secondary">
          这里是你所有文章的概览，包括已发布、草稿和需要修复的内容。
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
        <StatCard label="已发布" count={published.length} color="green" />
        <StatCard label="草稿" count={drafts.length} color="amber" />
        <StatCard label="待修复" count={invalid.length} color="red" />
        <Link
          href="/dashboard/write"
          className="flex min-h-[112px] items-center justify-center rounded-xl bg-accent px-5 py-5 text-center text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          进入在线写作工作台 V2
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {entries.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-6">
              {published.length > 0 && <PostSection title="已发布" posts={published} status="published" />}
              {drafts.length > 0 && <PostSection title="草稿" posts={drafts} status="draft" />}
              {invalid.length > 0 && <PostSection title="待修复" posts={invalid} status="invalid" />}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-bg-surface p-6 shadow-sm">
            <p className="text-sm text-text-muted">当前登录</p>
            <div className="mt-4 space-y-3 text-sm text-text-secondary">
              <div>
                <p className="text-xs text-text-muted">昵称</p>
                <p className="font-medium text-text-primary">{session.user?.name || "未提供"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">邮箱</p>
                <p className="font-medium text-text-primary">{session.user?.email || "未提供"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">登录方式</p>
                <p className="font-medium text-text-primary">{providerLabel}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Provider 账号 ID</p>
                <p className="break-all font-mono text-xs text-text-primary">
                  {session.user?.providerAccountId || session.user?.id || "未提供"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">白名单</p>
                <p className="font-medium text-text-primary">{session.user?.whitelisted ? "已授权" : "未授权"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-bg-surface p-6 shadow-sm">
            <p className="text-sm text-text-muted">写作提示</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-text-secondary">
              <li>• 文章放在 <code className="rounded bg-bg-subtle px-1 py-0.5 font-mono text-xs">content/posts/</code></li>
              <li>• 文件名格式：<code className="rounded bg-bg-subtle px-1 py-0.5 font-mono text-xs">yyyy-MM-dd_slug.mdx</code></li>
              <li>• <code className="rounded bg-bg-subtle px-1 py-0.5 font-mono text-xs">published: false</code> 为草稿</li>
              <li>• V2 写作工作台支持创建、保存、预览、发布与取消发布</li>
              <li>• 运营面板：<Link href="/dashboard/ops" className="text-accent hover:underline">/dashboard/ops</Link></li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "green" | "amber" | "red";
}) {
  const dotClass = {
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  }[color];

  const textClass = {
    green: "text-green-700 dark:text-green-400",
    amber: "text-amber-700 dark:text-amber-400",
    red: "text-red-700 dark:text-red-400",
  }[color];

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
        <span className="text-sm text-text-muted">{label}</span>
      </div>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${textClass}`}>{count}</p>
    </div>
  );
}

function PostSection({
  title,
  posts,
  status,
}: {
  title: string;
  posts: ReturnType<typeof getAllPostEntries>;
  status: PostStatus;
}) {
  const borderClass = {
    published: "border-green-200 dark:border-green-900/40",
    draft: "border-amber-200 dark:border-amber-900/40",
    invalid: "border-red-200 dark:border-red-900/40",
  }[status];

  const badgeClass = {
    published:
      "rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400",
    draft:
      "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    invalid:
      "rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400",
  }[status];

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-medium text-text-secondary">{title}</h2>
        <span className={badgeClass}>{posts.length} 篇</span>
      </div>
      <div className="space-y-3">
        {posts.map((entry) => (
          <PostRow key={entry.fileName} entry={entry} borderClass={borderClass} />
        ))}
      </div>
    </section>
  );
}

function PostRow({
  entry,
  borderClass,
}: {
  entry: ReturnType<typeof getAllPostEntries>[number];
  borderClass: string;
}) {
  const { post, fileName, status, validationError } = entry;

  return (
    <div className={`rounded-xl border bg-bg-surface p-4 shadow-sm ${borderClass}`}>
      {status === "invalid" ? (
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">{fileName}</p>
              <p className="mt-1 text-sm text-red-600/80 dark:text-red-500/80">{validationError}</p>
            </div>
            <span className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
              无效
            </span>
          </div>
        </div>
      ) : post ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-text-primary">{post.title}</p>
            <p className="mt-0.5 truncate text-xs text-text-muted">{fileName}</p>
            {status === "draft" && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{post.date} · {post.readingTime}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs text-text-muted">{post.date}</span>
            <Link
              href={status === "published" ? `/blog/${post.slug}` : `/dashboard/write/${post.slug}`}
              className="text-xs text-accent transition-colors hover:underline"
            >
              {status === "published" ? "查看 →" : "编辑 →"}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border p-12 text-center">
      <p className="text-base text-text-muted">
        还没有文章。去 <code className="font-mono text-sm">content/posts/</code> 创建第一篇 MDX 文件吧。
      </p>
    </div>
  );
}
