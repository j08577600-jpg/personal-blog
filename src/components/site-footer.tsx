export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-black/55 dark:text-white/55 sm:flex-row sm:items-center sm:justify-between">
        <p>Minimal notes on engineering, tools, and projects.</p>
        <p>Built with Next.js, typed carefully, kept intentionally small.</p>
      </div>
    </footer>
  );
}
