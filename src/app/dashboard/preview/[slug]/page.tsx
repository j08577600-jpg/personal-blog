import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuthorPageSession } from "@/lib/auth";
import { getPostBySlugForAuthor } from "@/lib/posts";
import ArticleRenderer from "@/components/article-renderer";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlugForAuthor(slug);

  if (!post) {
    return { title: "预览" };
  }

  return {
    title: `${post.title}（预览）`,
    description: post.excerpt,
  };
}

export default async function PreviewPage({ params }: Props) {
  await requireAuthorPageSession();

  const { slug } = await params;
  const post = getPostBySlugForAuthor(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href={`/dashboard/write/${post.slug}`}
          className="inline-flex items-center gap-1 text-sm text-text-muted transition-colors duration-150 hover:text-accent"
        >
          ← 返回编辑器
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-text-muted transition-colors duration-150 hover:text-accent"
        >
          返回博客 →
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
        {post.published ? "这是作者侧预览；文章已发布，公开页也会读取当前保存版本。" : "这是草稿预览，内容尚未公开发布。"}
      </div>

      <ArticleRenderer post={post} />
    </article>
  );
}
