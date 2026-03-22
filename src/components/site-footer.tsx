export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-black/55 dark:text-white/55 sm:flex-row sm:items-center sm:justify-between">
        <p>记录工程、工具、项目与值得保留的判断。</p>
        <p>基于 Next.js 构建，尽量克制，尽量长期可维护。</p>
      </div>
    </footer>
  );
}
