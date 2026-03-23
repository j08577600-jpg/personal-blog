import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] items-center px-6 py-20">
      <div className="w-full max-w-2xl rounded-3xl border border-black/6 bg-white p-10 dark:border-white/10 dark:bg-white/[0.02]">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">
          访问被拒绝
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">当前账号不在作者白名单内。</h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-black/65 dark:text-white/65">
          你的账号尚未获得后台访问权限。如需访问，请联系博主添加白名单。
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full border border-black/10 px-5 py-3 text-sm font-medium hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
