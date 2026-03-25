import { notFound } from "next/navigation";
import Link from "next/link";
import WorkbenchForm from "@/components/writer/workbench-form";
import { AuthorPostError, getEditablePostBySlug } from "@/lib/author-posts";
import { requireAuthorPageSession } from "@/lib/auth";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditDraftPage({ params }: Props) {
  await requireAuthorPageSession();

  const { slug } = await params;

  let draft;
  try {
    draft = getEditablePostBySlug(slug);
  } catch (error) {
    if (error instanceof AuthorPostError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/dashboard/write" className="text-sm text-text-muted transition hover:text-accent">
          ← 返回写作工作台
        </Link>
        <Link
          href={draft.published ? `/blog/${draft.slug}` : `/dashboard/preview/${draft.slug}`}
          className="text-sm text-text-muted transition hover:text-accent"
        >
          {draft.published ? "查看公开页 →" : "预览当前已保存版本 →"}
        </Link>
      </div>
      <WorkbenchForm mode="edit" currentSlug={slug} initialData={draft} />
    </div>
  );
}
