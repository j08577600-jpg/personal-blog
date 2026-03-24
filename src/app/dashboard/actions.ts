"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { savePostFromEditor } from "@/lib/dashboard-posts";

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

async function assertAuthor() {
  const session = (await getServerSession(authOptions)) as {
    user?: { whitelisted?: boolean } | null;
  } | null;

  if (!session?.user || session.user.whitelisted === false) {
    throw new Error("未授权");
  }
}

export async function savePostAction(formData: FormData) {
  await assertAuthor();

  const submitMode = String(formData.get("submitMode") || "draft");
  const originalSlug = String(formData.get("originalSlug") || "").trim();

  const result = savePostFromEditor({
    originalSlug: originalSlug || undefined,
    title: String(formData.get("title") || ""),
    slug: String(formData.get("slug") || ""),
    date: String(formData.get("date") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    tags: String(formData.get("tags") || ""),
    published: submitMode === "publish" ? true : parseBoolean(formData.get("published")),
    content: String(formData.get("content") || ""),
  });

  revalidatePath("/dashboard");
  revalidatePath("/blog");
  revalidatePath(`/blog/${result.slug}`);
  revalidatePath(`/dashboard/edit/${result.slug}`);
  revalidatePath(`/dashboard/preview/${result.slug}`);
  revalidatePath("/search");

  if (submitMode === "publish") {
    redirect(`/blog/${result.slug}`);
  }

  redirect(`/dashboard/preview/${result.slug}`);
}
