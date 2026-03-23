import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getPosts } from "@/lib/posts";

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
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
