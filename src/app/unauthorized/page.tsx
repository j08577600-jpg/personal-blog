import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] items-center px-6 py-20">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-bg-surface p-10 shadow-sm">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-text-muted">
          访问被拒绝
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          当前账号不在作者白名单内。
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-text-secondary">
          你的账号尚未获得后台访问权限。如需访问，请联系博主添加白名单。
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full border border-border px-5 py-3 text-sm font-medium text-text-secondary hover:border-accent hover:text-accent transition-colors duration-150"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
