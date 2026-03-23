import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getPostBySlug } from "@/lib/posts";
import ArticleRenderer from "@/components/article-renderer";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "预览" };
  }

  return {
    title: `${post.title}（预览）`,
    description: post.excerpt,
  };
}

export default async function PreviewPage({ params }: Props) {
  // 1. Auth check
  const session = (await getServerSession(authOptions)) as unknown as {
    user?: { whitelisted?: boolean } | null;
  } | null;

  if (!session?.user) {
    notFound();
  }

  if (session.user?.whitelisted === false) {
    notFound();
  }

  // 2. Load post
  const { slug } = await params;
  const post = getPostBySlug(slug);

  // 3. Only allow draft (published=false) posts; published posts have their own page
  if (!post || post.published) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      {/* Top navigation */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-black/45 hover:text-black/80 dark:text-white/45 dark:hover:text-white/80"
        >
          ← 返回控制台
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-black/45 hover:text-black/80 dark:text-white/45 dark:hover:text-white/80"
        >
          返回博客 →
        </Link>
      </div>

      {/* Draft banner */}
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
        📝 这是草稿预览，内容尚未公开发布
      </div>

      <ArticleRenderer post={post} />
    </article>
  );
}
