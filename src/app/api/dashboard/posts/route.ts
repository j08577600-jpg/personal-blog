import { NextResponse } from "next/server";
import { createDraft, AuthorPostError, type AuthorPostPayload } from "@/lib/author-posts";
import { requireAuthorApiSession } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await requireAuthorApiSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      date?: string;
      slug?: string;
      excerpt?: string;
      tags?: string[] | string;
      cover?: string;
      published?: boolean;
      body?: string;
    };
    const payload: Partial<AuthorPostPayload> = {
      title: body.title,
      date: body.date,
      slug: body.slug,
      excerpt: body.excerpt,
      tags: body.tags,
      cover: body.cover,
      published: body.published,
      body: body.body,
    };
    const result = createDraft(payload);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorPostError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "保存失败，请重试；原文件未覆盖" }, { status: 500 });
  }
}
