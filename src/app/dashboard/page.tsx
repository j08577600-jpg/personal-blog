/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = (await getServerSession(authOptions)) as any;

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">作者控制台</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          欢迎回来{session.user?.name ? `，${session.user.name}` : "。"}
        </h1>
        <p className="mt-6 text-base leading-8 text-black/65 dark:text-white/65">
          登录链路已经可用。当前版本先把作者身份、入口和后续开发基座搭稳，再逐步接入草稿、写作和发布能力。
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-black/6 bg-white p-8 dark:border-white/10 dark:bg-white/[0.02]">
          <p className="text-sm text-black/50 dark:text-white/50">当前登录用户</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-black/75 dark:text-white/75">
            <div>
              <p className="text-black/45 dark:text-white/45">昵称</p>
              <p className="font-medium text-black dark:text-white">{session.user?.name || "未提供"}</p>
            </div>
            <div>
              <p className="text-black/45 dark:text-white/45">邮箱</p>
              <p className="font-medium text-black dark:text-white">{session.user?.email || "未提供"}</p>
            </div>
            <div>
              <p className="text-black/45 dark:text-white/45">用户 ID</p>
              <p className="break-all font-mono text-xs text-black dark:text-white">{session.user?.id || "未提供"}</p>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-black/6 bg-white p-8 dark:border-white/10 dark:bg-white/[0.02]">
          <p className="text-sm text-black/50 dark:text-white/50">下一阶段</p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-black/72 dark:text-white/72">
            <li>• 接入作者白名单，只允许你本人进入后台</li>
            <li>• 增加文章元数据管理</li>
            <li>• 做本地草稿与发布流程</li>
            <li>• 补文章封面、SEO 与订阅能力</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
