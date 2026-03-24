import { savePostAction } from "@/app/dashboard/actions";
import type { EditorSeed } from "@/lib/dashboard-posts";

export function PostEditorForm({
  seed,
  mode,
}: {
  seed: EditorSeed;
  mode: "create" | "edit";
}) {
  return (
    <form action={savePostAction} className="space-y-8">
      <input type="hidden" name="originalSlug" value={mode === "edit" ? seed.slug : ""} />

      <section className="grid gap-5 rounded-2xl border border-border bg-bg-surface p-6 shadow-sm md:grid-cols-2">
        <Field label="标题" htmlFor="title">
          <input
            id="title"
            name="title"
            defaultValue={seed.title}
            required
            className="w-full rounded-xl border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent"
          />
        </Field>

        <Field label="Slug" htmlFor="slug">
          <input
            id="slug"
            name="slug"
            defaultValue={seed.slug}
            required
            pattern="[a-z0-9-]+"
            className="w-full rounded-xl border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent"
          />
        </Field>

        <Field label="日期" htmlFor="date">
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={seed.date}
            required
            className="w-full rounded-xl border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent"
          />
        </Field>

        <Field label="标签" htmlFor="tags" hint="用英文逗号分隔">
          <input
            id="tags"
            name="tags"
            defaultValue={seed.tags}
            className="w-full rounded-xl border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent"
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="摘要" htmlFor="excerpt">
            <textarea
              id="excerpt"
              name="excerpt"
              defaultValue={seed.excerpt}
              required
              rows={3}
              className="w-full rounded-xl border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent"
            />
          </Field>
        </div>

        <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-border bg-bg-primary px-4 py-3">
          <div>
            <p className="text-sm font-medium text-text-primary">保存为草稿</p>
            <p className="mt-1 text-xs text-text-muted">勾选后可继续走预览页，不公开。</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" name="published" value="true" defaultChecked={seed.published} className="h-4 w-4 rounded border-border" />
            已发布
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
        <Field label="正文（Markdown / MDX）" htmlFor="content">
          <textarea
            id="content"
            name="content"
            defaultValue={seed.content}
            required
            rows={22}
            className="min-h-[520px] w-full rounded-2xl border border-border bg-[#0f172a] px-5 py-4 font-mono text-sm leading-7 text-slate-100 outline-none transition focus:border-accent"
          />
        </Field>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          name="submitMode"
          value="draft"
          className="rounded-full border border-border bg-bg-surface px-5 py-2.5 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent"
        >
          保存草稿
        </button>
        <button
          type="submit"
          name="submitMode"
          value="publish"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          立即发布
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-2">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
      </div>
      {children}
    </label>
  );
}
