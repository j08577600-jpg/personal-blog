"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function HeaderAuthControls({
  isLoggedIn,
  userName,
}: {
  isLoggedIn: boolean;
  userName?: string;
}) {
  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-black/10 px-3 py-1.5 hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
      >
        GitHub 登录
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/dashboard" className="hidden text-xs text-black/50 hover:text-black sm:inline dark:text-white/50 dark:hover:text-white">
        {userName}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full border border-black/10 px-3 py-1.5 hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
      >
        退出登录
      </button>
    </div>
  );
}
