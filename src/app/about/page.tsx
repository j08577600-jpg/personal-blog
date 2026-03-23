import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "关于",
  description:
    "关于 jay 的个人博客：一个安静、清楚的空间，专注于工程实践、项目交付和更认真地思考问题。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      {/* Page label */}
      <p className="mb-6 text-sm uppercase tracking-[0.22em] text-text-muted">
        关于
      </p>

      {/* Headline with blue accent bar */}
      <div className="relative mb-10 pl-5">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-full" />
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          一个为清晰表达而建的个人站点。
        </h1>
      </div>

      {/* Body */}
      <div className="space-y-6 text-base leading-8 text-text-secondary">
        <p>
          这个博客用来发布技术笔记、项目更新、设计决策，以及那些值得长期保留的思考。
          写作对象是自己，也是对这些问题有过同样困惑的人。
        </p>
        <p>
          整体语气会保持克制。页面更重视排版、留白、可读性，以及一个能持续扩展但不变乱的结构。
          不追求更新频率，优先保证每篇都有值得重读的价值。
        </p>
        <p>
          长期方向很简单：写得更好，发布更稳定，把正在做的事情沉淀成可复用的知识。
        </p>
      </div>

      {/* Gradient divider */}
      <hr className="my-10 h-px border-0 bg-gradient-to-r from-transparent via-accent to-transparent" />

      {/* Two-column facts */}
      <div className="grid gap-8 sm:grid-cols-2">
        <section>
          <p className="mb-3 text-sm uppercase tracking-[0.18em] text-text-muted">
            技术栈
          </p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent shrink-0" />
              Next.js 16 + App Router
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent shrink-0" />
              TypeScript（严格模式）
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent shrink-0" />
              Tailwind CSS
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent shrink-0" />
              MDX（文件驱动内容）
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent shrink-0" />
              NextAuth v4（GitHub 登录）
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent shrink-0" />
              Nginx + systemd 部署
            </li>
          </ul>
        </section>

        <section>
          <p className="mb-3 text-sm uppercase tracking-[0.18em] text-text-muted">
            内容方向
          </p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent shrink-0" />
              工程实践与架构决策
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent shrink-0" />
              Agent 工作流与边界探索
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent shrink-0" />
              基础设施与部署自动化
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent shrink-0" />
              项目推进中的关键判断
            </li>
          </ul>
        </section>
      </div>

      {/* CTA */}
      <div className="mt-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-accent hover:underline transition-colors duration-150"
        >
          ← 返回博客
        </Link>
      </div>
    </div>
  );
}
