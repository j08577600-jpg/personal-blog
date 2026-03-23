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
    <div className="mx-auto max-w-3xl px-6 py-20">
      {/* Page label */}
      <p className="mb-6 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">
        关于
      </p>

      {/* Headline */}
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        一个为清晰表达而建的个人站点。
      </h1>

      {/* Body */}
      <div className="mt-10 space-y-6 text-base leading-8 text-black/68 dark:text-white/68">
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

      {/* Divider */}
      <hr className="my-12 border-black/6 dark:border-white/10" />

      {/* Two-column facts */}
      <div className="grid gap-8 sm:grid-cols-2">
        <section>
          <p className="mb-3 text-sm uppercase tracking-[0.18em] text-black/38 dark:text-white/38">
            技术栈
          </p>
          <ul className="space-y-2 text-sm text-black/65 dark:text-white/65">
            <li>Next.js 16 + App Router</li>
            <li>TypeScript（严格模式）</li>
            <li>Tailwind CSS</li>
            <li>MDX（文件驱动内容）</li>
            <li>NextAuth v4（GitHub 登录）</li>
            <li>Nginx + systemd 部署</li>
          </ul>
        </section>

        <section>
          <p className="mb-3 text-sm uppercase tracking-[0.18em] text-black/38 dark:text-white/38">
            内容方向
          </p>
          <ul className="space-y-2 text-sm text-black/65 dark:text-white/65">
            <li>工程实践与架构决策</li>
            <li>Agent 工作流与边界探索</li>
            <li>基础设施与部署自动化</li>
            <li>项目推进中的关键判断</li>
          </ul>
        </section>
      </div>

      {/* CTA */}
      <div className="mt-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-black/65 hover:text-black dark:text-white/65 dark:hover:text-white"
        >
          ← 查看所有文章
        </Link>
      </div>
    </div>
  );
}
