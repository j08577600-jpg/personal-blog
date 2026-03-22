import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-20">
      <div className="w-full rounded-3xl border border-black/6 bg-white p-10 dark:border-white/10 dark:bg-white/[0.02]">
        <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">GitHub sign-in</p>
        <h1 className="text-4xl font-semibold tracking-tight">Sign in to unlock the writing flow later.</h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-black/65 dark:text-white/65">
          Version one keeps authentication lightweight. GitHub is used as the first account provider for future private publishing and author tools.
        </p>

        <Link
          href="/api/auth/signin/github?callbackUrl=/dashboard"
          className="mt-8 inline-block rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-black"
        >
          Continue with GitHub
        </Link>
      </div>
    </div>
  );
}
