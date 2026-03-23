import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

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

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-8">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">文章</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{post.title}</h1>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-black/45 dark:text-white/45">
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.readingTime}</span>
        </div>
      </div>

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

      <MDXRemote source={post.content} />
    </article>
  );
}
