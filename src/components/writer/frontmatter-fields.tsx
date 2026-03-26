"use client";

import { useMemo, useState } from "react";

export type FrontmatterFormState = {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
  tags: string[];
  cover: string;
  series: string;
  recommended: boolean;
  updatedAt: string;
  updateNote: string;
  published: boolean;
};

export type FieldErrors = Partial<
  Record<
    "title" | "date" | "slug" | "excerpt" | "tags" | "cover" | "series" | "updatedAt" | "updateNote",
    string
  >
>;

type FrontmatterFieldsProps = {
  form: FrontmatterFormState;
  errors?: FieldErrors;
  onChange: <K extends keyof FrontmatterFormState>(
    key: K,
    value: FrontmatterFormState[K]
  ) => void;
  onRegenerateSlug: () => void;
  disabled?: boolean;
};

function inputClass(hasError?: boolean) {
  return `rounded-xl border bg-bg-surface px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent ${
    hasError ? "border-red-300" : "border-border"
  }`;
}

function TagInput({
  tags,
  disabled,
  error,
  onChange,
}: {
  tags: string[];
  disabled?: boolean;
  error?: string;
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const normalizedTags = useMemo(
    () => Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean))),
    [tags]
  );

  function commitDraft() {
    const nextTags = Array.from(
      new Set(
        `${draft}`
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .concat(normalizedTags)
      )
    );

    setDraft("");
    onChange(nextTags);
  }

  function removeTag(tag: string) {
    onChange(normalizedTags.filter((item) => item !== tag));
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`rounded-xl border bg-bg-surface px-3 py-3 transition focus-within:border-accent ${
          error ? "border-red-300" : "border-border"
        }`}
      >
        <div className="flex flex-wrap gap-2">
          {normalizedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              disabled={disabled}
              className="rounded-full bg-accent-subtle px-3 py-1 text-xs font-medium text-accent transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {tag} ×
            </button>
          ))}
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "," || event.key === "Enter") {
                event.preventDefault();
                commitDraft();
              }

              if (event.key === "Backspace" && !draft && normalizedTags.length > 0) {
                removeTag(normalizedTags[normalizedTags.length - 1]);
              }
            }}
            onBlur={() => {
              if (draft.trim()) {
                commitDraft();
              }
            }}
            disabled={disabled}
            className="min-w-[140px] flex-1 border-none bg-transparent px-1 py-1 text-sm text-text-primary outline-none"
            placeholder="输入后按 Enter 或逗号"
          />
        </div>
      </div>
      <p className="text-xs text-text-muted">标签会去重并直接写入 frontmatter 数组。</p>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

export default function FrontmatterFields({
  form,
  errors,
  onChange,
  onRegenerateSlug,
  disabled,
}: FrontmatterFieldsProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-bg-subtle/60 p-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-text-primary">基础信息</p>
          <p className="mt-1 text-xs text-text-muted">先把标题和摘要写清楚，其他信息稍后补也可以。</p>
        </div>
        <div className="grid gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">标题</span>
            <input
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              disabled={disabled}
              className={inputClass(Boolean(errors?.title))}
              placeholder="给文章起一个清楚的标题"
            />
            {errors?.title ? <span className="text-xs text-red-600">{errors.title}</span> : null}
          </label>

          <label className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-text-primary">摘要</span>
              <span className="text-xs text-text-muted">建议 60-140 字，当前 {form.excerpt.trim().length} 字</span>
            </div>
            <textarea
              value={form.excerpt}
              onChange={(event) => onChange("excerpt", event.target.value)}
              disabled={disabled}
              rows={4}
              className={inputClass(Boolean(errors?.excerpt))}
              placeholder="一句话说明这篇文章在讲什么"
            />
            {errors?.excerpt ? <span className="text-xs text-red-600">{errors.excerpt}</span> : null}
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-bg-subtle/60 p-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-text-primary">URL 与时间</p>
          <p className="mt-1 text-xs text-text-muted">slug 决定链接地址；日期会参与文件名与公开排序。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">日期</span>
            <input
              value={form.date}
              onChange={(event) => onChange("date", event.target.value)}
              disabled={disabled}
              className={inputClass(Boolean(errors?.date))}
              placeholder="2026-03-24"
            />
            <span className="text-xs text-text-muted">使用 `yyyy-MM-dd`，例如 `2026-03-25`。</span>
            {errors?.date ? <span className="text-xs text-red-600">{errors.date}</span> : null}
          </label>

          <label className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-text-primary">Slug</span>
              <button
                type="button"
                onClick={onRegenerateSlug}
                disabled={disabled}
                className="text-xs font-medium text-accent transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                从标题重新生成
              </button>
            </div>
            <input
              value={form.slug}
              onChange={(event) => onChange("slug", event.target.value)}
              disabled={disabled}
              className={inputClass(Boolean(errors?.slug))}
              placeholder="online-writing-workbench"
            />
            <span className="text-xs text-text-muted">只保留小写字母、数字和中横线。</span>
            {errors?.slug ? <span className="text-xs text-red-600">{errors.slug}</span> : null}
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-bg-subtle/60 p-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-text-primary">组织与展示</p>
          <p className="mt-1 text-xs text-text-muted">只扩展现有文章 frontmatter，不绑定跨内容类型的统一运营模型。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-medium text-text-primary">标签</span>
            <TagInput
              tags={form.tags}
              disabled={disabled}
              error={errors?.tags}
              onChange={(value) => onChange("tags", value)}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">系列</span>
            <input
              value={form.series}
              onChange={(event) => onChange("series", event.target.value)}
              disabled={disabled}
              className={inputClass(Boolean(errors?.series))}
              placeholder="例如：V2 开发记录"
            />
            <span className="text-xs text-text-muted">用于同系列文章互相跳转；留空则不启用。</span>
            {errors?.series ? <span className="text-xs text-red-600">{errors.series}</span> : null}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">推荐位</span>
            <button
              type="button"
              onClick={() => onChange("recommended", !form.recommended)}
              disabled={disabled}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                form.recommended
                  ? "border-accent bg-accent-subtle text-accent"
                  : "border-border bg-bg-surface text-text-secondary hover:border-accent hover:text-accent"
              }`}
            >
              {form.recommended ? "已加入首页推荐" : "未加入首页推荐"}
            </button>
            <span className="text-xs text-text-muted">只影响文章排序与首页推荐，不改变内容权限。</span>
          </label>

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-medium text-text-primary">封面图</span>
            <input
              value={form.cover}
              onChange={(event) => onChange("cover", event.target.value)}
              disabled={disabled}
              className={inputClass(Boolean(errors?.cover))}
              placeholder="/images/cover.jpg"
            />
            <span className="text-xs text-text-muted">可留空；建议填写站内绝对路径。</span>
            {errors?.cover ? <span className="text-xs text-red-600">{errors.cover}</span> : null}
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-bg-subtle/60 p-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-text-primary">更新记录</p>
          <p className="mt-1 text-xs text-text-muted">用于说明这次不是首次发布，而是对已发布文章的重要更新。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">更新日期</span>
            <input
              value={form.updatedAt}
              onChange={(event) => onChange("updatedAt", event.target.value)}
              disabled={disabled}
              className={inputClass(Boolean(errors?.updatedAt))}
              placeholder="2026-03-25"
            />
            <span className="text-xs text-text-muted">留空表示没有单独更新记录。</span>
            {errors?.updatedAt ? <span className="text-xs text-red-600">{errors.updatedAt}</span> : null}
          </label>

          <label className="flex flex-col gap-2 md:col-span-1">
            <span className="text-sm font-medium text-text-primary">更新说明</span>
            <textarea
              value={form.updateNote}
              onChange={(event) => onChange("updateNote", event.target.value)}
              disabled={disabled}
              rows={4}
              className={inputClass(Boolean(errors?.updateNote))}
              placeholder="例如：补充了部署检查清单与回滚说明。"
            />
            <span className="text-xs text-text-muted">填写说明时必须同时填写更新日期。</span>
            {errors?.updateNote ? <span className="text-xs text-red-600">{errors.updateNote}</span> : null}
          </label>
        </div>
      </section>
    </div>
  );
}
