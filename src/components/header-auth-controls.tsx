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
        className="inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors duration-150"
      >
        GitHub 登录
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="hidden text-xs text-text-muted hover:text-accent sm:inline transition-colors duration-150"
      >
        {userName}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary hover:border-accent hover:text-accent transition-colors duration-150"
      >
        退出
      </button>
    </div>
  );
}
