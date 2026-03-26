"use client";

type BodyEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
};

const SNIPPETS: Array<{ label: string; snippet: string }> = [
  { label: "标题", snippet: "## 小标题\n\n" },
  { label: "链接", snippet: "[链接文字](https://example.com)" },
  { label: "代码块", snippet: "```ts\nconsole.log(\"hello\");\n```\n\n" },
  { label: "引用", snippet: "> 一段值得单独强调的话\n\n" },
  { label: "图片模板", snippet: "![图片说明](/images/example.jpg)\n\n" },
];

export default function BodyEditor({
  value,
  onChange,
  disabled,
  focusMode = false,
  onToggleFocusMode,
}: BodyEditorProps) {
  function insertSnippet(snippet: string) {
    const prefix = value && !value.endsWith("\n") ? "\n\n" : "";
    onChange(`${value}${prefix}${snippet}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-sm font-medium text-text-primary">正文（Markdown / MDX）</span>
          <p className="mt-1 text-xs text-text-muted">只做模板插入，不接管你的写作结构。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SNIPPETS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => insertSnippet(item.snippet)}
              disabled={disabled}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              插入{item.label}
            </button>
          ))}
          {onToggleFocusMode ? (
            <button
              type="button"
              onClick={onToggleFocusMode}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-accent hover:text-accent"
            >
              {focusMode ? "退出专注" : "专注模式"}
            </button>
          ) : null}
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          rows={focusMode ? 28 : 22}
          className="min-h-[520px] rounded-2xl border border-slate-700 bg-[#0f1b2d] px-5 py-5 font-mono text-sm leading-7 text-slate-100 outline-none transition focus:border-accent"
          placeholder="开始写正文。支持 Markdown / MDX。"
          spellCheck={false}
        />
      </label>

      <div className="rounded-2xl border border-border bg-bg-subtle/70 p-4 text-xs leading-6 text-text-secondary">
        <p className="font-medium text-text-primary">Markdown 速查</p>
        <p className="mt-2">
          <code>## 标题</code>、<code>**强调**</code>、<code>[文字](链接)</code>、
          <code>{"```代码块```"}</code>、<code>&gt; 引用</code>、<code>- 列表项</code>
        </p>
      </div>
    </div>
  );
}
