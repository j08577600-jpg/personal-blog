import { redirect } from "next/navigation";
import { AuthProviderButton } from "@/components/github-signin-button";
import { getAuthorLoginState, getAuthorSession } from "@/lib/auth";

const providerDescriptions: Record<string, string> = {
  github: "适合日常开发环境与 GitHub 工作流。",
  google: "适合使用 Google 账号快速进入作者后台。",
  "azure-ad": "适合使用 Microsoft 账号或组织账户登录。",
};

export default async function LoginPage() {
  const session = await getAuthorSession();

  if (session?.user?.whitelisted) {
    redirect("/dashboard");
  }

  const { providers, whitelistEnabled } = getAuthorLoginState();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center px-6 py-20">
      <div className="w-full rounded-3xl border border-border bg-bg-surface p-10 shadow-sm">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-text-muted">作者入口</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          选择你习惯的账号登录，作者权限仍只看邮箱白名单。
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-text-secondary">
          支持 GitHub、Google、Microsoft 登录。OAuth 成功只代表身份验证通过，是否能进入作者后台仍由授权邮箱决定。
        </p>

        {session?.user && session.user.whitelisted === false ? (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-800">
            当前账号
            <span className="mx-1 font-medium">{session.user.email || session.user.name || "未提供邮箱"}</span>
            已登录，但不在作者白名单内。你可以切换其他 provider，或联系博主补充授权邮箱。
          </div>
        ) : null}

        {providers.length > 0 ? (
          <div className="mt-10 grid gap-4">
            {providers.map((provider) => (
              <AuthProviderButton
                key={provider.id}
                providerId={provider.id}
                label={provider.label}
                description={providerDescriptions[provider.id] || "使用该账号继续登录。"}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-7 text-red-700">
            当前环境尚未配置可用的登录 provider。请先补齐 OAuth 环境变量，再访问此页面。
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-border bg-bg-subtle px-5 py-4 text-sm leading-7 text-text-secondary">
          {whitelistEnabled
            ? "已启用作者邮箱白名单：同一邮箱通过不同 provider 登录，权限结论保持一致。"
            : "当前未配置作者邮箱白名单：任何已完成 OAuth 的账号都会被视为可进入作者后台。"}
        </div>
      </div>
    </div>
  );
}
