export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">About</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">A personal site built for clarity.</h1>
      <div className="mt-8 space-y-6 text-base leading-8 text-black/68 dark:text-white/68">
        <p>
          This blog is a place to publish technical notes, project updates, design decisions, and thinking that is worth keeping.
        </p>
        <p>
          The tone is intentionally restrained. The layout favors readable typography, quiet spacing, and a structure that can grow without becoming messy.
        </p>
        <p>
          The long-term direction is simple: write better, ship more consistently, and turn active work into durable knowledge.
        </p>
      </div>
    </div>
  );
}
