import { GitHubSignInButton } from "@/components/github-signin-button";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-20">
      <div className="w-full rounded-3xl border border-black/6 bg-white p-10 dark:border-white/10 dark:bg-white/[0.02]">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">GitHub 登录</p>
        <h1 className="text-4xl font-semibold tracking-tight">登录后，逐步解锁后续写作与发布流程。</h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-black/65 dark:text-white/65">
          第一版会把认证保持得足够轻。GitHub 作为首个登录提供方，后续会扩展为作者私有写作、草稿和发布能力。
        </p>

        <GitHubSignInButton />
      </div>
    </div>
  );
}
