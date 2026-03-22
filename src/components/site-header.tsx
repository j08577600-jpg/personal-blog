/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function SiteHeader() {
  const session = (await getServerSession(authOptions)) as any;

  return (
    <header className="border-b border-black/5 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-black/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          jay / 个人博客
        </Link>

        <nav className="flex items-center gap-6 text-sm text-black/70 dark:text-white/70">
          <Link href="/blog" className="hover:text-black dark:hover:text-white">
            博客
          </Link>
          <Link href="/about" className="hover:text-black dark:hover:text-white">
            关于
          </Link>
          {session?.user ? (
            <Link
              href="/api/auth/signout"
              className="rounded-full border border-black/10 px-3 py-1.5 hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
            >
              退出登录
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-black/10 px-3 py-1.5 hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
            >
              GitHub 登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
