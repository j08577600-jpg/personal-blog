import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "下一步计划",
  description: "博客的路线图：内容系统升级、作者工作台、以及更完整的发布流程。",
  alternates: { canonical: "/mdx-plan" },
};

export default function MdxPlanPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      {/* Title with accent bar */}
      <div className="relative mb-10 pl-5">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-full" />
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-text-muted">路线图</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          下一步，是内容系统。
        </h1>
      </div>

      <div className="space-y-6 text-base leading-8 text-text-secondary">
        <p>
          下一次真正有价值的升级，是把当前本地数据迁移到基于 MDX 的文章系统，
          并配合 frontmatter 元信息。这样写作、版本管理和发布会比把文章内容
          塞在 TypeScript 数组里自然得多，也更适合长期维护。
        </p>
        <p>
          等 MDX 跑通之后，现在这个轻量控制台就可以继续长成真正的作者工作台。
        </p>
      </div>

      {/* Gradient divider */}
      <hr className="my-10 h-px border-0 bg-gradient-to-r from-transparent via-accent to-transparent" />

      <div className="space-y-8">
        <section>
          <p className="mb-4 text-sm uppercase tracking-[0.18em] text-text-muted">
            当前进度
          </p>
          <ul className="space-y-3">
            {[
              "MDX 文件驱动内容层",
              "Frontmatter Zod 验证",
              "GitHub 登录 + 作者白名单",
              "Dashboard 内容工作台",
              "文章发布流程文档",
              "全站 SEO 元信息",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="mb-4 text-sm uppercase tracking-[0.18em] text-text-muted">
            计划中
          </p>
          <ul className="space-y-3">
            {[
              "私有在线写作编辑器（替代直接写 MDX）",
              "文章发布时间独立于文件名日期",
              "PR 审核流程",
              "作者头像与社交链接",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-text-muted">
                <span className="h-1 w-1 rounded-full bg-text-muted shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-accent hover:underline transition-colors duration-150"
        >
          ← 查看所有文章
        </Link>
      </div>
    </div>
  );
}
