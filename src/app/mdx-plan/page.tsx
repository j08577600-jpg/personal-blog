export default function MdxPlanPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">Roadmap</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Content system, next.</h1>
      <div className="mt-8 space-y-5 text-base leading-8 text-black/68 dark:text-white/68">
        <p>The next meaningful upgrade is moving from local data to MDX-based posts with frontmatter metadata.</p>
        <p>That will make writing, versioning, and publishing much more natural than keeping article content in TypeScript arrays.</p>
        <p>Once MDX is in place, the dashboard can evolve from a placeholder into a real author workflow.</p>
      </div>
    </div>
  );
}
