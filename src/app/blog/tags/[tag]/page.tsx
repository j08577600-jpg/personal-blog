import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { getAllTags, getPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

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
  const allTags = getAllTags();
  const tagEntry = allTags.find((t) => t.tag === decodedTag);
  if (!tagEntry) {
    return { title: "标签未找到" };
  }
  const url = `${siteConfig.siteUrl}/blog/tags/${encodeURIComponent(tag)}`;

  return {
    title: `标签：${decodedTag}`,
    description: `浏览所有带有「${decodedTag}」标签的文章，共 ${tagEntry.count} 篇。`,
    alternates: { canonical: url },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const allTags = getAllTags();

  if (!allTags.find((t) => t.tag === decodedTag)) {
    notFound();
  }

  const posts = getPosts().filter((p) => p.tags.includes(decodedTag));

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-12 max-w-2xl">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">标签</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {decodedTag}
          <span className="ml-3 text-2xl font-normal text-black/35 dark:text-white/35">({posts.length})</span>
        </h1>
      </div>
      {posts.length === 0 ? (
        <p className="py-12 text-center text-sm text-black/45 dark:text-white/45">该标签下暂无已发布文章。</p>
      ) : (
        <div className="grid gap-5">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
