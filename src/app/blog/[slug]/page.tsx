import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getPosts, getPostsInSeries, getRecommendedPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import ArticleRenderer from "@/components/article-renderer";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "文章未找到" };
  }

  const url = `${siteConfig.siteUrl}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: siteConfig.author.name }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      modifiedTime: post.updatedAt,
      authors: [siteConfig.author.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const seriesPosts = post.series ? getPostsInSeries(post.series, post.slug) : [];
  const recommendedPosts = getRecommendedPosts(3, post.slug);

  return (
    <article className="mx-auto max-w-4xl px-6 py-20">
      <Link
        href="/blog"
        className="mb-8 inline-block text-sm text-accent transition-colors duration-150 hover:underline"
      >
        ← 返回博客
      </Link>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <ArticleRenderer post={post} />

          {(post.updatedAt || post.updateNote) && (
            <section className="mt-8 rounded-2xl border border-border bg-bg-surface p-5 shadow-sm">
              <p className="text-sm font-medium text-text-primary">最近更新</p>
              <p className="mt-2 text-sm leading-7 text-text-secondary">
                {post.updatedAt ? `${post.updatedAt} · ` : ""}
                {post.updateNote || "这篇文章近期有内容调整。"}
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          {post.series ? (
            <section className="rounded-2xl border border-border bg-bg-surface p-5 shadow-sm">
              <p className="text-sm font-medium text-text-primary">系列文章</p>
              <p className="mt-1 text-xs text-text-muted">当前系列：{post.series}</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-xl bg-accent-subtle px-4 py-3 text-accent">
                  当前阅读：{post.title}
                </div>
                {seriesPosts.length > 0 ? (
                  seriesPosts.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/blog/${item.slug}`}
                      className="block rounded-xl border border-border px-4 py-3 text-text-secondary transition hover:border-accent hover:text-accent"
                    >
                      <div className="font-medium text-text-primary">{item.title}</div>
                      <div className="mt-1 text-xs text-text-muted">{item.date}</div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-text-muted">当前还没有同系列的其他已发布文章。</p>
                )}
              </div>
            </section>
          ) : null}

          {recommendedPosts.length > 0 ? (
            <section className="rounded-2xl border border-border bg-bg-surface p-5 shadow-sm">
              <p className="text-sm font-medium text-text-primary">继续阅读</p>
              <div className="mt-4 space-y-3 text-sm">
                {recommendedPosts.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    className="block rounded-xl border border-border px-4 py-3 text-text-secondary transition hover:border-accent hover:text-accent"
                  >
                    <div className="font-medium text-text-primary">{item.title}</div>
                    <div className="mt-1 text-xs text-text-muted">{item.date}</div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
