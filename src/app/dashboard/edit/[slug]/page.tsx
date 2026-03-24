import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getEditorSeedBySlug } from "@/lib/dashboard-posts";
import { PostEditorForm } from "@/components/post-editor-form";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const session = (await getServerSession(authOptions)) as {
    user?: { whitelisted?: boolean } | null;
  } | null;

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.whitelisted === false) {
    redirect("/unauthorized");
  }

  const { slug } = await params;
  const seed = getEditorSeedBySlug(slug);

  if (!seed) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-text-muted">作者控制台</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">编辑文章</h1>
          <p className="mt-3 text-sm leading-7 text-text-secondary">你可以继续改草稿，也可以直接把它发布出去。</p>
        </div>
        <Link href="/dashboard" className="text-sm text-text-secondary transition hover:text-accent">
          返回控制台 →
        </Link>
      </div>

      <PostEditorForm seed={seed} mode="edit" />
    </div>
  );
}
