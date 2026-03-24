"use client";

import { signIn } from "next-auth/react";

export function GitHubSignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
      className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors duration-150"
    >
      使用 GitHub 登录
    </button>
  );
}
