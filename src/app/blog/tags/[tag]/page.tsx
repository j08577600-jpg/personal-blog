import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
    <div className="mx-auto max-w-4xl px-6 py-20">
      {/* Title section with blue accent bar */}
      <div className="relative mb-12 max-w-2xl pl-5">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-full" />
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-text-muted">标签</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          {decodedTag}
          <span className="ml-3 text-xl font-normal text-text-muted">
            · {posts.length} 篇
          </span>
        </h1>
      </div>

      {/* Back to tags */}
      <div className="mb-8">
        <Link
          href="/blog/tags"
          className="inline-flex items-center gap-2 rounded-full bg-accent-subtle px-3 py-1.5 text-xs text-accent hover:bg-accent hover:text-white transition-colors duration-150"
        >
          ← 所有标签
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-muted">该标签下暂无已发布文章。</p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
