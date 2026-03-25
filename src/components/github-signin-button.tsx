"use client";

import { signIn } from "next-auth/react";

type AuthProviderButtonProps = {
  providerId: string;
  label: string;
  description: string;
};

function ProviderMark({ providerId }: { providerId: string }) {
  const baseClassName = "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-subtle text-sm font-semibold text-text-primary";

  if (providerId === "github") {
    return <span className={baseClassName}>GH</span>;
  }

  if (providerId === "google") {
    return <span className={baseClassName}>G</span>;
  }

  return <span className={baseClassName}>MS</span>;
}

export function AuthProviderButton({ providerId, label, description }: AuthProviderButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signIn(providerId, { callbackUrl: "/dashboard" })}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-bg-surface px-5 py-4 text-left transition-colors duration-150 hover:border-accent hover:bg-bg-subtle"
    >
      <div className="flex items-center gap-4">
        <ProviderMark providerId={providerId} />
        <div>
          <p className="text-sm font-medium text-text-primary">使用 {label} 登录</p>
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        </div>
      </div>
      <span className="text-sm text-text-muted">继续</span>
    </button>
  );
}
