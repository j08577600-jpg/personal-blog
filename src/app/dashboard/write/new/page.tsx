import Link from "next/link";
import WorkbenchForm from "@/components/writer/workbench-form";
import { createEmptyDraft } from "@/lib/author-posts";
import { requireAuthorPageSession } from "@/lib/auth";

export default async function NewDraftPage() {
  await requireAuthorPageSession();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/dashboard/write" className="text-sm text-text-muted transition hover:text-accent">
          ← 返回写作工作台
        </Link>
      </div>
      <WorkbenchForm mode="create" initialData={createEmptyDraft()} forceDraftOnCreate />
    </div>
  );
}
