"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FrontmatterFields, {
  type FieldErrors,
  type FrontmatterFormState,
} from "@/components/writer/frontmatter-fields";
import BodyEditor from "@/components/writer/body-editor";
import PublishToggle from "@/components/writer/publish-toggle";
import { slugifyPostValue } from "@/lib/post-slug";

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

type SaveIntent = "manual" | "autosave" | "preview" | "publish-toggle";
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

type FormState = FrontmatterFormState & {
  body: string;
  sourceFileName: string;
  lastKnownMtimeMs: number;
};

type LocalSnapshot = {
  savedAt: string;
  form: FormState;
};

const EMPTY_FIELD_ERRORS: FieldErrors = {};
const AUTOSAVE_DELAY_MS = 4000;

function formatTime(value: number | null) {
  if (!value) return "尚未保存";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function buildStorageKey(mode: WorkbenchFormProps["mode"], slug?: string) {
  return `writer-workbench:${mode}:${slug || "new"}`;
}

function normalizeFieldErrors(message: string): FieldErrors {
  const lower = message.toLowerCase();
  const errors: FieldErrors = {};

  if (lower.includes("title")) errors.title = message;
  if (lower.includes("date")) errors.date = message;
  if (lower.includes("slug") || lower.includes("文件名冲突")) errors.slug = message;
  if (lower.includes("excerpt")) errors.excerpt = message;
  if (lower.includes("tag")) errors.tags = message;
  if (lower.includes("cover")) errors.cover = message;

  return Object.keys(errors).length > 0 ? errors : EMPTY_FIELD_ERRORS;
}

function getBlockingIssues(form: FormState, forceDraftOnCreate: boolean, mode: WorkbenchFormProps["mode"]) {
  const issues: string[] = [];

  if (!form.title.trim()) issues.push("标题不能为空");
  if (!form.slug.trim()) issues.push("slug 不能为空");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
    issues.push("slug 只能包含小写字母、数字和中横线");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date.trim())) issues.push("日期格式须为 yyyy-MM-dd");
  if (!form.excerpt.trim()) issues.push("摘要不能为空");
  if (forceDraftOnCreate && mode === "create") issues.push("新建后先保存，再决定是否发布");

  return Array.from(new Set(issues));
}

function formsEqual(a: FormState, b: FormState) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function WorkbenchForm({
  mode,
  forceDraftOnCreate = false,
  initialData,
  currentSlug,
}: WorkbenchFormProps) {
  const router = useRouter();
  const initialForm = useMemo<FormState>(
    () => ({
      title: initialData.title,
      date: initialData.date,
      slug: initialData.slug,
      excerpt: initialData.excerpt,
      tags: initialData.tags,
      cover: initialData.cover ?? "",
      published: initialData.published,
      body: initialData.body,
      sourceFileName: initialData.sourceFileName,
      lastKnownMtimeMs: initialData.lastKnownMtimeMs,
    }),
    [initialData]
  );

  const [form, setForm] = useState<FormState>(initialForm);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(EMPTY_FIELD_ERRORS);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(mode === "create");
  const [restoreCandidate, setRestoreCandidate] = useState<LocalSnapshot | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveStateRef = useRef<SaveState>("idle");
  const restoredOnceRef = useRef(false);
  const latestFormRef = useRef<FormState>(initialForm);
  const baselineFormRef = useRef<FormState>(initialForm);
  const storageKey = useMemo(() => buildStorageKey(mode, currentSlug || initialData.slug), [currentSlug, initialData.slug, mode]);

  const publishLabel = useMemo(
    () => (form.published ? "取消发布" : "发布"),
    [form.published]
  );
  const hasUnsavedChanges = !formsEqual(form, baselineFormRef.current);
  const publishIssues = getBlockingIssues(form, forceDraftOnCreate, mode);

  useEffect(() => {
    latestFormRef.current = form;
    if (hasUnsavedChanges && saveStateRef.current !== "saving") {
      setSaveState("dirty");
      saveStateRef.current = "dirty";
    }
  }, [form, hasUnsavedChanges]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(storageKey);
    if (!raw || restoredOnceRef.current) return;

    try {
      const snapshot = JSON.parse(raw) as LocalSnapshot;
      if (!snapshot?.form) return;
      if (!formsEqual(snapshot.form, initialForm)) {
        setRestoreCandidate(snapshot);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [initialForm, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const shouldKeepDraft = hasUnsavedChanges || saveStateRef.current === "error" || saveStateRef.current === "saving";

    if (shouldKeepDraft) {
      const snapshot: LocalSnapshot = {
        savedAt: new Date().toISOString(),
        form,
      };
      window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
      return;
    }

    window.localStorage.removeItem(storageKey);
  }, [form, hasUnsavedChanges, storageKey]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges && saveStateRef.current !== "saving") {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateFrontmatterField<K extends keyof FrontmatterFormState>(
    key: K,
    value: FrontmatterFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function regenerateSlug() {
    const nextSlug = slugifyPostValue(form.title);
    if (nextSlug) {
      updateFrontmatterField("slug", nextSlug);
    }
  }

  const markSaved = useCallback((nextForm: FormState, message?: string | null) => {
    baselineFormRef.current = nextForm;
    latestFormRef.current = nextForm;
    setForm(nextForm);
    setLastSavedAt(Date.now());
    setSaveState("saved");
    saveStateRef.current = "saved";
    setNotice(message || "已保存");
    setError(null);
    setFieldErrors(EMPTY_FIELD_ERRORS);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const submit = useCallback(async (intent: SaveIntent) => {
    if (intent === "publish-toggle" && publishIssues.length > 0) {
      setError("当前还有关键信息未补齐，暂时不能发布。");
      setFieldErrors(normalizeFieldErrors(publishIssues.join("；")));
      return;
    }

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    setError(null);
    setNotice(null);
    setFieldErrors(EMPTY_FIELD_ERRORS);
    setSaveState("saving");
    saveStateRef.current = "saving";

    const nextPublished =
      forceDraftOnCreate && mode === "create"
        ? false
        : intent === "publish-toggle"
          ? !form.published
          : form.published;

    try {
      const payload = {
        title: form.title,
        date: form.date,
        slug: form.slug,
        excerpt: form.excerpt,
        tags: form.tags,
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
      const nextForm: FormState = {
        ...form,
        published: savedPublished,
        sourceFileName: result.fileName || form.sourceFileName,
        lastKnownMtimeMs: result.lastKnownMtimeMs || form.lastKnownMtimeMs,
      };
      const successMessage =
        result.warning ||
        (intent === "publish-toggle"
          ? savedPublished
            ? "已确认发布"
            : "已确认取消发布"
          : intent === "autosave"
            ? "自动保存完成"
            : "保存成功");

      markSaved(nextForm, successMessage);

      if (mode === "create") {
        router.replace(`/dashboard/write/${nextSlug}`);
      } else if (nextSlug !== currentSlug) {
        router.replace(`/dashboard/write/${nextSlug}`);
      }

      if (intent === "preview") {
        router.push(`/dashboard/preview/${nextSlug}`);
        return;
      }

      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "保存失败，请重试；原文件未覆盖";
      setFieldErrors(normalizeFieldErrors(message));
      setError(message);
      setSaveState("error");
      saveStateRef.current = "error";
    }
  }, [currentSlug, forceDraftOnCreate, form, markSaved, mode, publishIssues, router]);

  useEffect(() => {
    if (!hasUnsavedChanges || mode !== "edit") {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      return;
    }

    if (saveStateRef.current === "saving") return;

    autosaveTimerRef.current = setTimeout(() => {
      void submit("autosave");
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [form, hasUnsavedChanges, mode, submit]);

  function restoreLocalSnapshot() {
    if (!restoreCandidate) return;
    restoredOnceRef.current = true;
    setForm(restoreCandidate.form);
    latestFormRef.current = restoreCandidate.form;
    setRestoreCandidate(null);
    setNotice("已恢复本地未保存内容，请尽快再次保存。");
    setError(null);
    setSaveState("dirty");
    saveStateRef.current = "dirty";
  }

  function discardLocalSnapshot() {
    restoredOnceRef.current = true;
    setRestoreCandidate(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.22em] text-text-muted">
              {mode === "create" ? "新建草稿" : "在线写作工作台 V2"}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
                {mode === "create" ? "先开始写，再补齐设置" : form.title || "未命名文章"}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  form.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {form.published ? "已发布" : "草稿"}
              </span>
              <span className="rounded-full bg-bg-subtle px-3 py-1 text-xs font-medium text-text-secondary">
                {saveState === "saving"
                  ? "保存中..."
                  : saveState === "error"
                    ? "保存失败"
                    : saveState === "dirty"
                      ? "存在未保存改动"
                      : lastSavedAt
                        ? `已保存 ${formatTime(lastSavedAt)}`
                        : "尚未保存"}
              </span>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-text-secondary">
              保存会直接写入 `content/posts/*.mdx`。自动保存每 4 秒尝试一次；预览仅展示最近一次已保存版本。
            </p>
          </div>

          <div className="rounded-xl border border-border bg-bg-subtle px-4 py-3 text-xs text-text-muted">
            <p>当前文件：{form.sourceFileName || "尚未创建"}</p>
            <p className="mt-1">编辑地址：/dashboard/write/{form.slug || "new"}</p>
            <p className="mt-1">最后保存：{formatTime(lastSavedAt)}</p>
          </div>
        </div>
      </div>

      {restoreCandidate ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">检测到本地未恢复内容</p>
              <p className="mt-1 text-xs text-amber-700">
                本地缓存时间：{new Date(restoreCandidate.savedAt).toLocaleString("zh-CN")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={restoreLocalSnapshot}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
              >
                恢复本地内容
              </button>
              <button
                type="button"
                onClick={discardLocalSnapshot}
                className="rounded-xl border border-amber-300 px-4 py-2 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
              >
                忽略
              </button>
            </div>
          </div>
        </div>
      ) : null}

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

      <div className={`grid gap-6 ${focusMode ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_360px]"}`}>
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
            <BodyEditor
              value={form.body}
              onChange={(value) => updateField("body", value)}
              disabled={saveState === "saving"}
              focusMode={focusMode}
              onToggleFocusMode={() => setFocusMode((current) => !current)}
            />
          </section>

          <section className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-primary">文章设置</p>
                <p className="mt-1 text-xs text-text-muted">frontmatter 分组收起，避免把第一屏注意力从正文上抢走。</p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen((current) => !current)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-accent hover:text-accent"
              >
                {settingsOpen ? "收起设置" : "展开设置"}
              </button>
            </div>
            {settingsOpen ? (
              <div className="mt-5">
                <FrontmatterFields
                  form={form}
                  errors={fieldErrors}
                  onChange={updateFrontmatterField}
                  onRegenerateSlug={regenerateSlug}
                  disabled={saveState === "saving"}
                />
              </div>
            ) : null}
          </section>
        </div>

        {!focusMode ? (
          <aside className="space-y-4">
            <section className="rounded-2xl border border-border bg-bg-surface p-5 shadow-sm">
              <PublishToggle
                published={form.published}
                publishActionLabel={publishLabel}
                description={
                  form.published
                    ? "这篇文章已经对外可见；取消发布会保留文件，但从公开博客撤下。"
                    : "这篇文章还是草稿；发布前会再次确认标题、slug 与日期。"
                }
              />
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => void submit("manual")}
                  disabled={saveState === "saving"}
                  className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saveState === "saving" ? "保存中..." : saveState === "error" ? "重新保存" : "立即保存"}
                </button>
                <button
                  type="button"
                  onClick={() => void submit("preview")}
                  disabled={saveState === "saving"}
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  保存并预览
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ok = window.confirm(
                      form.published
                        ? `确认取消发布《${form.title || "未命名文章"}》？公开页会暂时下线，但文件仍保留。`
                        : `确认发布《${form.title || "未命名文章"}》？\n\n链接：/blog/${form.slug || "pending-slug"}\n日期：${form.date || "待填写"}`
                    );
                    if (ok) {
                      void submit("publish-toggle");
                    }
                  }}
                  disabled={saveState === "saving" || publishIssues.length > 0}
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {forceDraftOnCreate && mode === "create" ? "新建后可发布" : publishLabel}
                </button>
                {publishIssues.length > 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-800">
                    <p className="font-medium">发布前先处理这些问题：</p>
                    <ul className="mt-2 space-y-1">
                      {publishIssues.map((issue) => (
                        <li key={issue}>- {issue}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-bg-surface p-5 shadow-sm">
              <p className="text-sm font-medium text-text-primary">文档状态</p>
              <div className="mt-4 space-y-3 text-sm text-text-secondary">
                <div>
                  <p className="text-xs text-text-muted">当前文件</p>
                  <p className="font-medium text-text-primary">{form.sourceFileName || "尚未创建"}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">目标 URL</p>
                  <p className="font-medium text-text-primary">/blog/{form.slug || "pending-slug"}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">自动保存</p>
                  <p className="font-medium text-text-primary">{mode === "edit" ? "已开启，4 秒延迟" : "创建前不自动落盘"}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">恢复策略</p>
                  <p className="font-medium text-text-primary">未保存内容会写入本地缓存，刷新后可恢复</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-bg-surface p-5 shadow-sm">
              <p className="text-sm font-medium text-text-primary">快速动作</p>
              <div className="mt-4 space-y-2 text-sm">
                <Link href="/dashboard/write" className="block text-text-secondary transition hover:text-accent">
                  返回写作列表
                </Link>
                {form.slug ? (
                  <Link
                    href={form.published ? `/blog/${form.slug}` : `/dashboard/preview/${form.slug}`}
                    className="block text-text-secondary transition hover:text-accent"
                  >
                    {form.published ? "查看公开页" : "查看已保存预览"}
                  </Link>
                ) : null}
              </div>
            </section>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
