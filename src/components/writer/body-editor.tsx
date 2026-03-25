type BodyEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function BodyEditor({ value, onChange, disabled }: BodyEditorProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-text-primary">正文（Markdown / MDX）</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={22}
        className="min-h-[480px] rounded-2xl border border-border bg-slate-950 px-4 py-4 font-mono text-sm leading-7 text-slate-100 outline-none transition focus:border-accent"
        placeholder="开始写正文。支持 Markdown / MDX。"
        spellCheck={false}
      />
    </label>
  );
}
