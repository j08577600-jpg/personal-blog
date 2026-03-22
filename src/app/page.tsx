import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getPosts } from "@/lib/posts";

export default function Home() {
  const posts = getPosts().slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <section className="max-w-3xl py-12">
        <p className="mb-4 text-sm uppercase tracking-[0.24em] text-black/40 dark:text-white/40">
          Minimal technical blog
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
          Building a quiet place for engineering notes, project logs, and sharper thinking.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-black/65 dark:text-white/65">
          This site is designed to stay small, clear, and useful. Less noise, better writing, stronger structure.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-black"
          >
            Read the blog
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
          >
            About this site
          </Link>
          <Link
            href="/mdx-plan"
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
          >
            What comes next
          </Link>
        </div>
      </section>

      <section className="grid gap-10 border-t border-black/6 py-14 dark:border-white/10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">
                Featured posts
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">Start here</h2>
            </div>
            <Link href="/blog" className="text-sm text-black/55 hover:text-black dark:text-white/55 dark:hover:text-white">
              View all
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
            Focus
          </p>
          <h3 className="mb-4 text-2xl font-semibold tracking-tight">What this blog is for</h3>
          <div className="space-y-4 text-sm leading-7 text-black/65 dark:text-white/65">
            <p>Working notes on software, agent workflows, infrastructure decisions, and project execution.</p>
            <p>Version one stays deliberately simple so publishing can happen before the system gets heavy.</p>
            <p>GitHub sign-in is included as the first step toward a future private writing and publishing workflow.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
