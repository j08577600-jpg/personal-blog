import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getPosts } from "@/lib/posts";

export default function Home() {
  const posts = getPosts().slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <section className="max-w-3xl py-12">
        <p className="mb-4 text-sm uppercase tracking-[0.24em] text-black/40 dark:text-white/40">
          极简技术博客
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
          用一个安静、清楚的空间，记录工程实践、项目进展和更锋利的思考。
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-black/65 dark:text-white/65">
          这个网站会尽量保持小而稳、简洁而有用。少一点噪音，多一点结构感和可读性。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-black"
          >
            查看文章
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
          >
            关于本站
          </Link>
          <Link
            href="/mdx-plan"
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
          >
            下一步计划
          </Link>
        </div>
      </section>

      <section className="grid gap-10 border-t border-black/6 py-14 dark:border-white/10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">
                精选文章
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">从这里开始</h2>
            </div>
            <Link href="/blog" className="text-sm text-black/55 hover:text-black dark:text-white/55 dark:hover:text-white">
              查看全部
            </Link>
          </div>
          <div className="grid gap-5">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-black/6 bg-white p-8 dark:border-white/10 dark:bg-white/[0.02]">
          <p className="mb-3 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">
            站点定位
          </p>
          <h3 className="mb-4 text-2xl font-semibold tracking-tight">这个博客用来做什么</h3>
          <div className="space-y-4 text-sm leading-7 text-black/65 dark:text-white/65">
            <p>记录软件开发、Agent 工作流、基础设施决策，以及项目推进中的关键判断。</p>
            <p>第一版会故意保持克制，先把发布链路跑通，再逐步增加更重的内容系统和作者能力。</p>
            <p>GitHub 登录已经接入，后面会逐步扩展为更完整的私有写作与发布流程。</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
