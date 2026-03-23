import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getAllTags, getPostsByTag } from "@/lib/posts";

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);

  if (posts.length === 0) {
    return { title: "标签未找到" };
  }

  return {
    title: `标签：${decodedTag}`,
    description: `含有「${decodedTag}」标签的所有文章。`,
    alternates: { canonical: `/tags/${encodeURIComponent(tag)}` },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-12 max-w-2xl">
        <Link
          href="/tags"
          className="mb-6 inline-block text-sm text-black/45 hover:text-black/80 dark:text-white/45 dark:hover:text-white/80"
        >
          ← 所有标签
        </Link>
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">标签</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{decodedTag}</h1>
        <p className="mt-3 text-sm text-black/45 dark:text-white/45">
          {posts.length} 篇 文章
        </p>
      </div>
      <div className="grid gap-5">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
