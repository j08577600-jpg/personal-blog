/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { HeaderAuthControls } from "@/components/header-auth-controls";

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
          <Link href="/tags" className="hover:text-black dark:hover:text-white">
            标签
          </Link>
          <Link href="/about" className="hover:text-black dark:hover:text-white">
            关于
          </Link>
          <HeaderAuthControls
            isLoggedIn={Boolean(session?.user)}
            userName={session?.user?.name ?? session?.user?.email ?? "作者"}
          />
        </nav>
      </div>
    </header>
  );
}
