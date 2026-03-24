/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getAllPostEntries, type PostStatus } from "@/lib/posts";
import { getDashboardStats } from "@/lib/dashboard-posts";

export default async function DashboardPage() {
  const session = (await getServerSession(authOptions)) as any;

  if (!session?.user) {
    redirect("/login");
  }

  if ((session.user as any)?.whitelisted === false) {
    redirect("/unauthorized");
  }

  const entries = getAllPostEntries();
  const stats = getDashboardStats();

  const published = entries.filter((e) => e.status === "published");
  const drafts = entries.filter((e) => e.status === "draft");
  const invalid = entries.filter((e) => e.status === "invalid");

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="relative mb-12 max-w-3xl pl-5">
        <span className="absolute bottom-0 left-0 top-0 w-1 rounded-full bg-accent" />
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-text-muted">作者控制台</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          内容工作台
          {session.user?.name ? `，${session.user.name}` : ""}
        </h1>
        <p className="mt-4 text-base leading-8 text-text-secondary">
          现在这里已经能新建、编辑、保存草稿和直接发布。统计和监控也先给到基础版。
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/new"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          新建文章
        </Link>
        <Link
          href="/search"
          className="rounded-full border border-border bg-bg-surface px-5 py-2.5 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent"
        >
          去搜索页看入口效果
        </Link>
      </div>

      <div className="mb-10 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="总文章" count={stats.total} color="slate" />
        <StatCard label="已发布" count={stats.published} color="green" />
        <StatCard label="草稿" count={stats.drafts} color="amber" />
        <StatCard label="待修复" count={stats.invalid} color="red" />
        <StatCard label="标签数" count={stats.tagCount} color="blue" />
        <StatCard label="最新发布" value={stats.newestPublished ?? "-"} color="violet" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
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
              <InfoRow label="昵称" value={session.user?.name || "未提供"} />
              <InfoRow label="邮箱" value={session.user?.email || "未提供"} />
              <InfoRow label="GitHub ID" value={session.user?.id || "未提供"} mono />
              <InfoRow label="白名单" value={(session.user as any)?.whitelisted ? "已授权" : "未授权"} />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-bg-surface p-6 shadow-sm">
            <p className="text-sm text-text-muted">写作与发布</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-text-secondary">
              <li>• 在这里直接新建 / 编辑文章</li>
              <li>• 保存草稿后会跳到预览页</li>
              <li>• 立即发布会直接写入 `published: true`</li>
              <li>• 文件仍落在 <code className="rounded bg-bg-subtle px-1 py-0.5 font-mono text-xs">content/posts/</code></li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-bg-surface p-6 shadow-sm">
            <p className="text-sm text-text-muted">基础监控</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-text-secondary">
              <li>• 健康检查：<code className="rounded bg-bg-subtle px-1 py-0.5 font-mono text-xs">/api/health</code></li>
              <li>• 服务：<code className="rounded bg-bg-subtle px-1 py-0.5 font-mono text-xs">personal-blog.service</code></li>
              <li>• 发布前检查：<code className="rounded bg-bg-subtle px-1 py-0.5 font-mono text-xs">scripts/release-check.sh</code></li>
              <li>• 日志轮转已接入，告警仍留待后续增强</li>
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
  value,
  color,
}: {
  label: string;
  count?: number;
  value?: string;
  color: "green" | "amber" | "red" | "blue" | "violet" | "slate";
}) {
  const dotClass = {
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    violet: "bg-violet-500",
    slate: "bg-slate-500",
  }[color];

  const textClass = {
    green: "text-green-700 dark:text-green-400",
    amber: "text-amber-700 dark:text-amber-400",
    red: "text-red-700 dark:text-red-400",
    blue: "text-blue-700 dark:text-blue-400",
    violet: "text-violet-700 dark:text-violet-400",
    slate: "text-slate-700 dark:text-slate-300",
  }[color];

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
        <span className="text-sm text-text-muted">{label}</span>
      </div>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${textClass}`}>{value ?? count ?? 0}</p>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`font-medium text-text-primary ${mono ? "break-all font-mono text-xs" : ""}`}>{value}</p>
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
    published: "rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400",
    draft: "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    invalid: "rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400",
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
            <span className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">无效</span>
          </div>
        </div>
      ) : post ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-text-primary">{post.title}</p>
            <p className="mt-0.5 truncate text-xs text-text-muted">{fileName}</p>
            <p className="mt-1 text-xs text-text-muted">{post.date} · {post.readingTime}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {status === "published" && (
              <>
                <Link href={`/blog/${post.slug}`} className="text-xs text-accent transition-colors hover:underline">查看 →</Link>
                <Link href={`/dashboard/edit/${post.slug}`} className="text-xs text-text-secondary transition-colors hover:text-accent hover:underline">编辑</Link>
              </>
            )}
            {status === "draft" && (
              <>
                <Link href={`/dashboard/preview/${post.slug}`} className="text-xs text-amber-600 transition-colors hover:underline dark:text-amber-400">预览 →</Link>
                <Link href={`/dashboard/edit/${post.slug}`} className="text-xs text-text-secondary transition-colors hover:text-accent hover:underline">编辑</Link>
              </>
            )}
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
        还没有文章。现在可以直接在控制台里创建第一篇。
      </p>
      <Link href="/dashboard/new" className="mt-4 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover">
        新建文章
      </Link>
    </div>
  );
}
