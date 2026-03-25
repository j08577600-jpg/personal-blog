export type FrontmatterFormState = {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
  tagsText: string;
  cover: string;
  published: boolean;
};

export type FieldErrors = Partial<Record<"title" | "date" | "slug" | "excerpt", string>>;

type FrontmatterFieldsProps = {
  form: FrontmatterFormState;
  errors?: FieldErrors;
  onChange: <K extends keyof FrontmatterFormState>(key: K, value: FrontmatterFormState[K]) => void;
  disabled?: boolean;
};

function inputClass(hasError?: boolean) {
  return `rounded-xl border bg-bg-surface px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent ${
    hasError ? "border-red-300" : "border-border"
  }`;
}

export default function FrontmatterFields({ form, errors, onChange, disabled }: FrontmatterFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-2 md:col-span-2">
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
        <span className="text-sm font-medium text-text-primary">日期</span>
        <input
          value={form.date}
          onChange={(event) => onChange("date", event.target.value)}
          disabled={disabled}
          className={inputClass(Boolean(errors?.date))}
          placeholder="2026-03-24"
        />
        {errors?.date ? <span className="text-xs text-red-600">{errors.date}</span> : null}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-primary">Slug</span>
        <input
          value={form.slug}
          onChange={(event) => onChange("slug", event.target.value)}
          disabled={disabled}
          className={inputClass(Boolean(errors?.slug))}
          placeholder="online-writing-workbench"
        />
        {errors?.slug ? <span className="text-xs text-red-600">{errors.slug}</span> : null}
      </label>

      <label className="flex flex-col gap-2 md:col-span-2">
        <span className="text-sm font-medium text-text-primary">摘要</span>
        <textarea
          value={form.excerpt}
          onChange={(event) => onChange("excerpt", event.target.value)}
          disabled={disabled}
          rows={3}
          className={inputClass(Boolean(errors?.excerpt))}
          placeholder="一句话说明这篇文章在讲什么"
        />
        {errors?.excerpt ? <span className="text-xs text-red-600">{errors.excerpt}</span> : null}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-primary">标签</span>
        <input
          value={form.tagsText}
          onChange={(event) => onChange("tagsText", event.target.value)}
          disabled={disabled}
          className="rounded-xl border border-border bg-bg-surface px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent"
          placeholder="工程, 写作, 工作流"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-primary">封面图</span>
        <input
          value={form.cover}
          onChange={(event) => onChange("cover", event.target.value)}
          disabled={disabled}
          className="rounded-xl border border-border bg-bg-surface px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent"
          placeholder="/images/cover.jpg"
        />
      </label>
    </div>
  );
}
