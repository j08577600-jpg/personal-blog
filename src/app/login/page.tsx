import { GitHubSignInButton } from "@/components/github-signin-button";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-20">
      <div className="w-full rounded-3xl border border-border bg-bg-surface p-10 shadow-sm">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-text-muted">GitHub 登录</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          登录后，逐步解锁后续写作与发布流程。
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-text-secondary">
          第一版会把认证保持得足够轻。GitHub 作为首个登录提供方，后续会扩展为作者私有写作、草稿和发布能力。
        </p>

        <GitHubSignInButton />
      </div>
    </div>
  );
}
