import { requireAuthorPageSession } from "@/lib/auth";
import { getAllPostEntries } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export default async function DashboardOpsPage() {
  await requireAuthorPageSession();

  const entries = getAllPostEntries();
  const published = entries.filter((entry) => entry.status === "published");
  const recommended = published.filter((entry) => entry.post?.recommended);
  const withSeries = published.filter((entry) => entry.post?.series);
  const withUpdates = published.filter((entry) => entry.post?.updatedAt || entry.post?.updateNote);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="relative mb-10 max-w-3xl pl-5">
        <span className="absolute bottom-0 left-0 top-0 w-1 rounded-full bg-accent" />
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-text-muted">发布运营 / 基础分析</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          最小运营面板
        </h1>
        <p className="mt-4 text-base leading-8 text-text-secondary">
          这里只做当前阶段真正能落地的秩序：发布 checklist、首页推荐、系列与更新记录覆盖率，以及分析/反馈接入位。
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard label="已发布文章" value={published.length} />
        <StatCard label="首页推荐" value={recommended.length} />
        <StatCard label="系列文章" value={withSeries.length} />
        <StatCard label="带更新记录" value={withUpdates.length} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-text-primary">发布前检查</p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-text-secondary">
              <li>• 作者侧发布按钮已经接入 checklist 与二次确认，不再只是盲切 `published`。</li>
              <li>• 重点检查标题、slug、日期、摘要，以及更新发布时的更新记录。</li>
              <li>• 生产前仍需执行 `npm run lint`、`npm run build` 与 `bash scripts/release-check.sh`。</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-text-primary">已启用的运营字段</p>
            <div className="mt-4 space-y-3 text-sm text-text-secondary">
              <p>当前只在 `posts` frontmatter 上消费以下轻量字段：</p>
              <ul className="space-y-2 leading-7">
                <li>• `recommended: true`：进入首页推荐，并在文章列表中提前展示。</li>
                <li>• `series: &quot;...&quot;`：在文章页展示同系列导航。</li>
                <li>• `updatedAt` + `updateNote`：展示最近更新信息，并写入搜索语料。</li>
              </ul>
              <p className="text-xs text-text-muted">
                未扩到 `projects` / `notes` / `reading-list`，避免抢统一内容模型的定义权。
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-text-primary">分析与反馈</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-text-secondary">
              <p>
                当前分析策略：<strong>不假装已经有完整数据平台</strong>。先保留最小接入位，明确需要看的指标，再决定是否接第三方服务。
              </p>
              <ul className="space-y-2">
                <li>• 建议先观察：来源、热门文章、站内搜索词、反馈邮件主题。</li>
                <li>• 建议候选：Plausible 或 Umami；当前仓库仅提供运行说明与环境变量占位。</li>
                <li>• 读者反馈先走邮件：{siteConfig.feedback.email}</li>
              </ul>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-text-primary">当前分析策略</p>
            <div className="mt-4 space-y-3 text-sm text-text-secondary">
              <div>
                <p className="text-xs text-text-muted">Provider</p>
                <p className="font-medium text-text-primary">{siteConfig.analytics.provider}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">说明</p>
                <p className="leading-6">{siteConfig.analytics.note}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-text-primary">下一步判断标准</p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-text-secondary">
              <li>• 推荐位是否真的带来更高点击</li>
              <li>• 系列文章是否形成连续阅读</li>
              <li>• 更新记录是否帮助老文章重新被访问</li>
              <li>• 反馈邮件是否集中暴露导航或内容问题</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5 shadow-sm">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">{value}</p>
    </div>
  );
}
