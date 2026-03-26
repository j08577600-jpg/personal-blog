type PublishToggleProps = {
  published: boolean;
  publishActionLabel?: string;
  description?: string;
};

export default function PublishToggle({
  published,
  publishActionLabel,
  description,
}: PublishToggleProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-primary">发布状态</p>
          <p className="text-xs text-text-muted">
            {description ||
              (published
                ? "当前为已发布，公开博客会读取它。"
                : "当前为草稿，只在作者侧可见。")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {publishActionLabel ? (
            <span className="rounded-full bg-bg-subtle px-3 py-1 text-xs font-medium text-text-secondary">
              {publishActionLabel}
            </span>
          ) : null}
          <span
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {published ? "已发布" : "草稿"}
          </span>
        </div>
      </div>
    </div>
  );
}
