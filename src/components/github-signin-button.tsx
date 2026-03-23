"use client";

import { signIn } from "next-auth/react";

export function GitHubSignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
      className="mt-8 inline-block rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-black"
    >
      使用 GitHub 登录
    </button>
  );
}
