/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { authOptions } from "@/lib/auth";
import { getAllPostEntries } from "@/lib/posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getAllPostEntries().find((e) => e.post?.slug === slug);

  if (!entry?.post) {
    return { title: "预览" };
  }

  return {
    title: `[预览] ${entry.post.title}`,
    description: entry.post.excerpt,
  };
}

export default async function PreviewPage({ params }: Props) {
  const session = (await getServerSession(authOptions)) as any;

  if (!session?.user) {
    redirect("/login");
  }

  if ((session.user as any)?.whitelisted === false) {
    redirect("/unauthorized");
  }

  const { slug } = await params;
  const entries = getAllPostEntries();
  const entry = entries.find((e) => e.post?.slug === slug);

  if (!entry?.post) {
    notFound();
  }

  // Show all posts (published + draft) — the page itself is auth-protected
  const post = entry.post;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Preview banner */}
      <div className="mb-8 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-center gap-2.5">
          <svg
            className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
            预览模式 · 这是一篇草稿，不会对外公开
          </span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
        >
          ← 返回工作台
        </Link>
      </div>

      {/* Article header */}
      <div className="mb-8">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">
          {entry.status === "published" ? "已发布" : "草稿"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{post.title}</h1>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-black/45 dark:text-white/45">
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.readingTime}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-10 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-black/8 px-2.5 py-1 text-xs text-black/55 dark:border-white/10 dark:text-white/55"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* MDX content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MDXRemote source={post.content} />
      </div>

      {/* Footer back link */}
      <div className="mt-16 border-t border-black/8 pt-8 dark:border-white/10">
        <Link
          href="/dashboard"
          className="text-sm text-black/45 hover:text-black/80 dark:text-white/45 dark:hover:text-white/80"
        >
          ← 返回内容工作台
        </Link>
      </div>
    </div>
  );
}
