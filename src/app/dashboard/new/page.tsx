import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { createEmptyEditorSeed } from "@/lib/dashboard-posts";
import { PostEditorForm } from "@/components/post-editor-form";

export default async function NewPostPage() {
  const session = (await getServerSession(authOptions)) as {
    user?: { whitelisted?: boolean } | null;
  } | null;

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.whitelisted === false) {
    redirect("/unauthorized");
  }

  const seed = createEmptyEditorSeed();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-text-muted">作者控制台</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">新建文章</h1>
          <p className="mt-3 text-sm leading-7 text-text-secondary">这是最小可用版编辑器：支持新建、保存草稿、直接发布。</p>
        </div>
        <Link href="/dashboard" className="text-sm text-text-secondary transition hover:text-accent">
          返回控制台 →
        </Link>
      </div>

      <PostEditorForm seed={seed} mode="create" />
    </div>
  );
}
