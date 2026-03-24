/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { HeaderAuthControls } from "@/components/header-auth-controls";
import { ThemeToggle } from "@/components/theme-toggle";

export async function SiteHeader() {
  const session = (await getServerSession(authOptions)) as any;

  return (
    <header className="border-b border-border bg-bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2 group">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          <span className="text-sm font-semibold text-text-primary tracking-tight">
            jay
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/blog"
            className="text-text-secondary hover:text-accent transition-colors duration-150 relative group py-0.5"
          >
            博客
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-accent transition-all duration-200 group-hover:w-full rounded-full" />
          </Link>
          <Link
            href="/search"
            className="text-text-secondary hover:text-accent transition-colors duration-150 relative group py-0.5"
            aria-label="搜索"
          >
            <span className="sr-only">搜索</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </Link>
          <Link
            href="/about"
            className="text-text-secondary hover:text-accent transition-colors duration-150 relative group py-0.5"
          >
            关于
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-accent transition-all duration-200 group-hover:w-full rounded-full" />
          </Link>
          <ThemeToggle />
          <HeaderAuthControls
            isLoggedIn={Boolean(session?.user)}
            userName={session?.user?.name ?? session?.user?.email ?? "作者"}
          />
        </nav>
      </div>
    </header>
  );
}
