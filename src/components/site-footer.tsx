import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="group relative flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span className="text-sm font-semibold tracking-tight text-text-primary">
              jay
            </span>
          </Link>
          <div className="flex gap-4 text-sm text-text-muted">
            <a
              href="https://github.com/j08577600-jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-150 hover:text-accent"
            >
              GitHub
            </a>
            <a
              href="/feed.xml"
              className="transition-colors duration-150 hover:text-accent"
            >
              RSS
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-xs text-text-muted">
          <Link href="/blog" className="transition-colors duration-150 hover:text-text-secondary">
            博客
          </Link>
          <Link href="/about" className="transition-colors duration-150 hover:text-text-secondary">
            关于
          </Link>
          <Link href="/blog/tags" className="transition-colors duration-150 hover:text-text-secondary">
            标签
          </Link>
          <a
            href={`mailto:${siteConfig.feedback.email}`}
            className="transition-colors duration-150 hover:text-text-secondary"
          >
            反馈
          </a>
        </div>

        <p className="mt-4 text-xs text-text-muted">
          © 2026 · 使用 Next.js 构建 · 反馈请发 {siteConfig.feedback.email}
        </p>
      </div>
    </footer>
  );
}
