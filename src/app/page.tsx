import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getPosts, getRecommendedPosts } from "@/lib/posts";
import { getRecentNotes } from "@/lib/notes";

export const metadata: Metadata = {
  title: "首页",
  description:
    "极简技术博客。记录工程实践、项目进展、Agent 工作流，以及更认真地思考问题。",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const recommendedPosts = getRecommendedPosts(3);
  const posts = (recommendedPosts.length > 0 ? recommendedPosts : getPosts()).slice(0, 3);
  const recentNotes = getRecentNotes(3);

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <section className="relative max-w-3xl py-16 pl-5">
        <span className="absolute bottom-0 left-0 top-0 w-1 rounded-full bg-accent" />
        <p className="mb-4 text-sm uppercase tracking-[0.24em] text-text-muted">极简技术博客</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance text-text-primary sm:text-5xl">
          用一个安静、清楚的空间，记录工程实践、项目进展和更锋利的思考。
        </h1>
        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-text-secondary">
          记录技术思考，分享前端与全栈实践。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
          >
            查看文章
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-full border border-accent px-5 py-2.5 text-sm font-medium text-accent transition-colors duration-150 hover:bg-accent-subtle"
          >
            关于我
          </Link>
          <Link
            href="/mdx-plan"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            下一步计划
          </Link>
        </div>
      </section>

      <section className="grid gap-10 border-t border-border py-14 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.22em] text-text-muted">
                {recommendedPosts.length > 0 ? "推荐阅读" : "精选文章"}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-text-primary">从这里开始</h2>
            </div>
            <Link href="/blog" className="text-sm text-text-muted transition-colors duration-150 hover:text-accent">
              查看全部
            </Link>
          </div>
          <div className="grid gap-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>

        <aside className="h-fit space-y-8">
          {recentNotes.length > 0 && (
            <div className="rounded-xl bg-bg-subtle p-6 shadow-sm">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-1 text-sm uppercase tracking-[0.22em] text-text-muted">碎片笔记</p>
                  <h3 className="text-base font-semibold tracking-tight text-text-primary">
                    最新 {recentNotes.length} 条
                  </h3>
                </div>
                <Link
                  href="/notes"
                  className="text-xs text-text-muted transition-colors duration-150 hover:text-accent"
                >
                  查看全部
                </Link>
              </div>
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <div key={note.slug} className="group">
                    <Link
                      href={`/notes/${note.slug}`}
                      className="block text-sm font-medium leading-snug text-text-primary transition-colors duration-150 group-hover:text-accent"
                    >
                      {note.title}
                    </Link>
                    <span className="text-xs text-text-muted">{note.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-bg-subtle p-6 shadow-sm">
            <p className="mb-2 text-sm uppercase tracking-[0.22em] text-text-muted">站点定位</p>
            <h3 className="mb-4 text-lg font-semibold tracking-tight text-text-primary">
              这个博客用来做什么
            </h3>
            <div className="space-y-4 text-sm leading-7 text-text-secondary">
              <p>记录软件开发、Agent 工作流、基础设施决策，以及项目推进中的关键判断。</p>
              <p>第一版会故意保持克制，先把发布链路跑通，再逐步增加更重的内容系统和作者能力。</p>
              <p>现在已经补上发布 checklist、首页推荐和更新记录的最小秩序；更完整的跨内容运营模型仍后置到统一内容层稳定之后。</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
