"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontmatterFields, {
  type FieldErrors,
  type FrontmatterFormState,
} from "@/components/writer/frontmatter-fields";
import BodyEditor from "@/components/writer/body-editor";
import PublishToggle from "@/components/writer/publish-toggle";

type WorkbenchFormProps = {
  mode: "create" | "edit";
  forceDraftOnCreate?: boolean;
  initialData: {
    title: string;
    date: string;
    slug: string;
    excerpt: string;
    tags: string[];
    cover?: string;
    published: boolean;
    body: string;
    sourceFileName: string;
    lastKnownMtimeMs: number;
  };
  currentSlug?: string;
};

type ActionMode = "save" | "preview" | "publish-toggle";

const EMPTY_FIELD_ERRORS: FieldErrors = {};

type FormState = FrontmatterFormState & {
  body: string;
  sourceFileName: string;
  lastKnownMtimeMs: number;
};

export default function WorkbenchForm({
  mode,
  forceDraftOnCreate = false,
  initialData,
  currentSlug,
}: WorkbenchFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    title: initialData.title,
    date: initialData.date,
    slug: initialData.slug,
    excerpt: initialData.excerpt,
    tagsText: initialData.tags.join(", "),
    cover: initialData.cover ?? "",
    published: initialData.published,
    body: initialData.body,
    sourceFileName: initialData.sourceFileName,
    lastKnownMtimeMs: initialData.lastKnownMtimeMs,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(EMPTY_FIELD_ERRORS);

  const publishLabel = useMemo(
    () => (form.published ? "取消发布" : "发布"),
    [form.published]
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateFrontmatterField<K extends keyof FrontmatterFormState>(
    key: K,
    value: FrontmatterFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function mapFieldError(message: string): FieldErrors {
    if (message.includes("title")) return { title: message };
    if (message.includes("date")) return { date: message };
    if (message.includes("slug")) return { slug: message };
    if (message.includes("excerpt")) return { excerpt: message };
    return EMPTY_FIELD_ERRORS;
  }

  async function submit(action: ActionMode) {
    setSubmitting(true);
    setError(null);
    setNotice(null);
    setFieldErrors(EMPTY_FIELD_ERRORS);

    const nextPublished =
      forceDraftOnCreate && mode === "create"
        ? false
        : action === "publish-toggle"
          ? !form.published
          : form.published;

    try {
      const payload = {
        title: form.title,
        date: form.date,
        slug: form.slug,
        excerpt: form.excerpt,
        tags: form.tagsText,
        cover: form.cover,
        published: nextPublished,
        body: form.body,
        sourceFileName: form.sourceFileName,
        lastKnownMtimeMs: form.lastKnownMtimeMs,
      };

      const response = await fetch(
        mode === "create"
          ? "/api/dashboard/posts"
          : `/api/dashboard/posts/${currentSlug}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = (await response.json()) as {
        error?: string;
        slug?: string;
        fileName?: string;
        lastKnownMtimeMs?: number;
        warning?: string | null;
        published?: boolean;
      };

      if (!response.ok) {
        throw new Error(result.error || "保存失败，请重试；原文件未覆盖");
      }

      const nextSlug = result.slug || form.slug;
      const savedPublished =
        typeof result.published === "boolean" ? result.published : nextPublished;
      updateField("published", savedPublished);
      updateField("sourceFileName", result.fileName || form.sourceFileName);
      updateField(
        "lastKnownMtimeMs",
        result.lastKnownMtimeMs || form.lastKnownMtimeMs
      );
      setNotice(
        result.warning ||
          (action === "publish-toggle" ? `${publishLabel}成功` : "保存成功")
      );

      if (mode === "create") {
        router.replace(`/dashboard/write/${nextSlug}`);
      } else if (nextSlug !== currentSlug) {
        router.replace(`/dashboard/write/${nextSlug}`);
      }

      if (action === "preview") {
        router.push(`/dashboard/preview/${nextSlug}`);
        return;
      }

      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "保存失败，请重试；原文件未覆盖";
      setFieldErrors(mapFieldError(message));
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-text-muted">
              {mode === "create" ? "新建草稿" : "在线写作工作台 V2"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
              {mode === "create" ? "创建一篇新的文章草稿" : form.title || "未命名文章"}
            </h1>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              保存会直接写入 `content/posts/*.mdx`。预览只支持保存后内容，不提供未保存实时预览。
            </p>
          </div>
          <div className="rounded-xl border border-border bg-bg-subtle px-4 py-3 text-xs text-text-muted">
            <p>当前文件：{form.sourceFileName || "尚未创建"}</p>
            <p className="mt-1">目标路由：/dashboard/write/{form.slug || "new-post"}</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
            <FrontmatterFields
              form={form}
              errors={fieldErrors}
              onChange={updateFrontmatterField}
              disabled={submitting}
            />
          </section>
          <section className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
            <BodyEditor
              value={form.body}
              onChange={(value) => updateField("body", value)}
              disabled={submitting}
            />
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-bg-surface p-5 shadow-sm">
            <PublishToggle published={form.published} />
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => submit("save")}
                disabled={submitting}
                className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "保存中..." : "保存"}
              </button>
              <button
                type="button"
                onClick={() => submit("preview")}
                disabled={submitting}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                保存并预览
              </button>
              <button
                type="button"
                onClick={() => submit("publish-toggle")}
                disabled={submitting || (forceDraftOnCreate && mode === "create")}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {forceDraftOnCreate && mode === "create" ? "新建后可发布" : publishLabel}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-text-primary">使用限制</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-text-secondary">
              <li>• 仅限白名单作者访问</li>
              <li>• 只写入 `content/posts/`</li>
              <li>• 保存时进行 mtime 冲突检测</li>
              <li>• slug/date 改变会触发文件名变更与冲突校验</li>
              <li>• 发布/取消发布走同一保存链路</li>
              {forceDraftOnCreate && mode === "create" ? <li>• 新建阶段强制保存为草稿，创建后再决定是否发布</li> : null}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
