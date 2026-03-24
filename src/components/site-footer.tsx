import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Logo + socials row */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="relative flex items-center gap-2 group">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
            <span className="text-sm font-semibold text-text-primary tracking-tight">
              jay
            </span>
          </Link>
          <div className="flex gap-4 text-text-muted text-sm">
            <a
              href="https://github.com/j08577600-jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors duration-150"
            >
              GitHub
            </a>
            <a
              href="/feed.xml"
              className="hover:text-accent transition-colors duration-150"
            >
              RSS
            </a>
          </div>
        </div>

        {/* Link row */}
        <div className="flex flex-wrap gap-6 text-xs text-text-muted">
          <Link href="/blog" className="hover:text-text-secondary transition-colors duration-150">
            博客
          </Link>
          <Link href="/about" className="hover:text-text-secondary transition-colors duration-150">
            关于
          </Link>
          <Link href="/blog/tags" className="hover:text-text-secondary transition-colors duration-150">
            标签
          </Link>
        </div>

        {/* Copyright */}
        <p className="mt-4 text-xs text-text-muted">
          © 2026 · 使用 Next.js 构建
        </p>
      </div>
    </footer>
  );
}
