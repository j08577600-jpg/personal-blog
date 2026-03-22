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
      <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">Dashboard</p>
      <h1 className="text-4xl font-semibold tracking-tight">Welcome back{session.user?.name ? `, ${session.user.name}` : ""}.</h1>
      <p className="mt-6 max-w-2xl text-base leading-8 text-black/65 dark:text-white/65">
        Authentication is live. This page is intentionally small for now and acts as the seed for future private author features.
      </p>
      <div className="mt-8 rounded-3xl border border-black/6 bg-white p-8 dark:border-white/10 dark:bg-white/[0.02]">
        <p className="text-sm text-black/55 dark:text-white/55">Planned next steps</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-black/72 dark:text-white/72">
          <li>Author-only writing tools</li>
          <li>Draft management</li>
          <li>MDX publishing workflow</li>
          <li>Simple analytics and content operations</li>
        </ul>
        <Link href="/blog" className="mt-6 inline-block text-sm font-medium underline underline-offset-4">
          Back to the blog
        </Link>
      </div>
    </div>
  );
}
