import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getReadingItemBySlug, getAllReadingItemSlugs } from "@/lib/reading-list";
import { siteConfig } from "@/lib/site";
import ReadingItemRenderer from "@/components/reading-item-renderer";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllReadingItemSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getReadingItemBySlug(slug);

  if (!item) {
    return { title: "条目未找到" };
  }

  const url = `${siteConfig.siteUrl}/reading-list/${item.slug}`;

  return {
    title: item.title,
    description: `${item.title} — ${item.type} · ${item.status}`,
    authors: [{ name: siteConfig.author.name }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: item.title,
      tags: item.tags,
    },
    twitter: {
      card: "summary",
      title: item.title,
    },
  };
}

export default async function ReadingItemPage({ params }: Props) {
  const { slug } = await params;
  const item = getReadingItemBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <Link
        href="/reading-list"
        className="mb-8 inline-block text-sm text-accent hover:underline transition-colors duration-150"
      >
        ← 返回阅读清单
      </Link>
      <ReadingItemRenderer item={item} />
    </article>
  );
}
