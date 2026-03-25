import { NextResponse } from "next/server";
import {
  AuthorPostError,
  getEditablePostBySlug,
  updateDraft,
  type AuthorPostPayload,
} from "@/lib/author-posts";
import { requireAuthorApiSession } from "@/lib/auth";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const auth = await requireAuthorApiSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { slug } = await params;
    return NextResponse.json(getEditablePostBySlug(slug));
  } catch (error) {
    if (error instanceof AuthorPostError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "读取失败，请稍后重试" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Props) {
  const auth = await requireAuthorApiSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { slug } = await params;
    const body = (await request.json()) as {
      title?: string;
      date?: string;
      slug?: string;
      excerpt?: string;
      tags?: string[] | string;
      cover?: string;
      published?: boolean;
      body?: string;
      sourceFileName?: string;
      lastKnownMtimeMs?: number | string;
    };
    const payload: Partial<AuthorPostPayload> & {
      sourceFileName?: string;
      lastKnownMtimeMs?: number;
    } = {
      title: body.title,
      date: body.date,
      slug: body.slug,
      excerpt: body.excerpt,
      tags: body.tags,
      cover: body.cover,
      published: body.published,
      body: body.body,
      sourceFileName: body.sourceFileName,
      lastKnownMtimeMs: Number(body.lastKnownMtimeMs),
    };
    const result = updateDraft(slug, payload);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthorPostError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "保存失败，请重试；原文件未覆盖" }, { status: 500 });
  }
}
