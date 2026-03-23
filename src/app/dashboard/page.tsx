/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getAllPostEntries, type PostStatus } from "@/lib/posts";

export default async function DashboardPage() {
  const session = (await getServerSession(authOptions)) as any;

  if (!session?.user) {
    redirect("/login");
  }

  if ((session.user as any)?.whitelisted === false) {
    redirect("/unauthorized");
  }

  const entries = getAllPostEntries();

  const published = entries.filter((e) => e.status === "published");
  const drafts = entries.filter((e) => e.status === "draft");
  const invalid = entries.filter((e) => e.status === "invalid");

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      {/* Header */}
      <div className="relative mb-12 max-w-3xl pl-5">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-full" />
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-text-muted">
          作者控制台
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          内容工作台
          {session.user?.name ? `，${session.user.name}` : ""}
        </h1>
        <p className="mt-4 text-base leading-8 text-text-secondary">
          这里是你所有文章的概览，包括已发布、草稿和需要修复的内容。
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-10 grid grid-cols-3 gap-4">
        <StatCard label="已发布" count={published.length} color="green" />
        <StatCard label="草稿" count={drafts.length} color="amber" />
        <StatCard label="待修复" count={invalid.length} color="red" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main: post list */}
        <div>
          {entries.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-6">
              {published.length > 0 && (
                <PostSection title="已发布" posts={published} status="published" />
              )}
              {drafts.length > 0 && (
                <PostSection title="草稿" posts={drafts} status="draft" />
              )}
              {invalid.length > 0 && (
                <PostSection title="待修复" posts={invalid} status="invalid" />
              )}
            </div>
          )}
        </div>

        {/* Sidebar: user info */}
        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-bg-surface p-6 shadow-sm">
            <p className="text-sm text-text-muted">当前登录</p>
            <div className="mt-4 space-y-3 text-sm text-text-secondary">
              <div>
                <p className="text-text-muted text-xs">昵称</p>
                <p className="font-medium text-text-primary">
                  {session.user?.name || "未提供"}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs">邮箱</p>
                <p className="font-medium text-text-primary">
                  {session.user?.email || "未提供"}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs">GitHub ID</p>
                <p className="break-all font-mono text-xs text-text-primary">
                  {session.user?.id || "未提供"}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs">白名单</p>
                <p className="font-medium text-text-primary">
                  {(session.user as any)?.whitelisted ? "已授权" : "未授权"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-bg-surface p-6 shadow-sm">
            <p className="text-sm text-text-muted">写作提示</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-text-secondary">
              <li>• 文章放在 <code className="font-mono text-xs bg-bg-subtle px-1 py-0.5 rounded">content/posts/</code></li>
              <li>• 文件名格式：<code className="font-mono text-xs bg-bg-subtle px-1 py-0.5 rounded">yyyy-MM-dd_slug.mdx</code></li>
              <li>• <code className="font-mono text-xs bg-bg-subtle px-1 py-0.5 rounded">published: false</code> 为草稿</li>
              <li>• 所有 frontmatter 字段必填，见规范文档</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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
    <div
      className={`rounded-xl border bg-bg-surface p-4 shadow-sm ${borderClass}`}
    >
      {status === "invalid" ? (
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">
                {fileName}
              </p>
              <p className="mt-1 text-sm text-red-600/80 dark:text-red-500/80">
                {validationError}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
              无效
            </span>
          </div>
        </div>
      ) : post ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-text-primary">
              {post.title}
            </p>
            <p className="mt-0.5 truncate text-xs text-text-muted">
              {fileName}
            </p>
            {status === "draft" && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                {post.date} · {post.readingTime}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs text-text-muted">
              {post.date}
            </span>
            {status === "published" && (
              <Link
                href={`/blog/${post.slug}`}
                className="text-xs text-accent hover:underline transition-colors"
              >
                查看 →
              </Link>
            )}
            {status === "draft" && (
              <Link
                href={`/dashboard/preview/${post.slug}`}
                className="text-xs text-amber-600 hover:underline dark:text-amber-400 transition-colors"
              >
                预览 →
              </Link>
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
        还没有文章。去 <code className="font-mono text-sm">content/posts/</code>{" "}
        创建第一篇 MDX 文件吧。
      </p>
    </div>
  );
}
