/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = (await getServerSession(authOptions)) as any;

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">控制台</p>
      <h1 className="text-4xl font-semibold tracking-tight">欢迎回来{session.user?.name ? `，${session.user.name}` : ""}。</h1>
      <p className="mt-6 max-w-2xl text-base leading-8 text-black/65 dark:text-white/65">
        登录已经打通。这个页面目前保持轻量，作为后续作者功能、草稿管理和发布能力的起点。
      </p>
      <div className="mt-8 rounded-3xl border border-black/6 bg-white p-8 dark:border-white/10 dark:bg-white/[0.02]">
        <p className="text-sm text-black/55 dark:text-white/55">下一阶段计划</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-black/72 dark:text-white/72">
          <li>作者专用写作工具</li>
          <li>草稿管理</li>
          <li>基于 MDX 的发布流程</li>
          <li>基础内容运营与分析能力</li>
        </ul>
        <Link href="/blog" className="mt-6 inline-block text-sm font-medium underline underline-offset-4">
          返回博客
        </Link>
      </div>
    </div>
  );
}
