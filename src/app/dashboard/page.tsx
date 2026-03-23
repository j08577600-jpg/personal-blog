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
      <div className="mb-12 max-w-3xl">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">
          作者控制台
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          内容工作台
          {session.user?.name ? `，${session.user.name}` : ""}
        </h1>
        <p className="mt-4 text-base leading-8 text-black/65 dark:text-white/65">
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
          <section className="rounded-2xl border border-black/6 bg-white p-6 dark:border-white/10 dark:bg-white/[0.02]">
            <p className="text-sm text-black/50 dark:text-white/50">当前登录</p>
            <div className="mt-4 space-y-3 text-sm text-black/72 dark:text-white/72">
              <div>
                <p className="text-black/45 dark:text-white/45">昵称</p>
                <p className="font-medium text-black dark:text-white">
                  {session.user?.name || "未提供"}
                </p>
              </div>
              <div>
                <p className="text-black/45 dark:text-white/45">邮箱</p>
                <p className="font-medium text-black dark:text-white">
                  {session.user?.email || "未提供"}
                </p>
              </div>
              <div>
                <p className="text-black/45 dark:text-white/45">GitHub ID</p>
                <p className="break-all font-mono text-xs text-black dark:text-white">
                  {session.user?.id || "未提供"}
                </p>
              </div>
              <div>
                <p className="text-black/45 dark:text-white/45">白名单</p>
                <p className="font-medium text-black dark:text-white">
                  {(session.user as any)?.whitelisted ? "已授权" : "未授权"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/6 bg-white p-6 dark:border-white/10 dark:bg-white/[0.02]">
            <p className="text-sm text-black/50 dark:text-white/50">写作提示</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-black/65 dark:text-white/65">
              <li>• 文章放在 <code className="font-mono text-xs">content/posts/</code></li>
              <li>• 文件名格式：<code className="font-mono text-xs">yyyy-MM-dd_slug.mdx</code></li>
              <li>• <code className="font-mono text-xs">published: false</code> 为草稿</li>
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
    <div className="rounded-2xl border border-black/6 bg-white p-5 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
        <span className="text-sm text-black/50 dark:text-white/50">{label}</span>
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
        <h2 className="text-sm font-medium text-black/65 dark:text-white/65">{title}</h2>
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
      className={`rounded-xl border bg-white p-4 dark:bg-white/[0.02] ${borderClass}`}
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
            <p className="truncate font-medium text-black dark:text-white">
              {post.title}
            </p>
            <p className="mt-0.5 truncate text-xs text-black/45 dark:text-white/45">
              {fileName}
            </p>
            {status === "draft" && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                {post.date} · {post.readingTime}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs text-black/35 dark:text-white/35">
              {post.date}
            </span>
            {status === "published" && (
              <Link
                href={`/blog/${post.slug}`}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                查看 →
              </Link>
            )}
            {status === "draft" && post && (
              <Link
                href={`/dashboard/preview/${post.slug}`}
                className="text-xs text-amber-600 hover:underline dark:text-amber-400"
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
    <div className="rounded-2xl border border-dashed border-black/12 dark:border-white/10 p-12 text-center">
      <p className="text-base text-black/45 dark:text-white/45">
        还没有文章。去 <code className="font-mono text-sm">content/posts/</code>{" "}
        创建第一篇 MDX 文件吧。
      </p>
    </div>
  );
}
