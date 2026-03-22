export default function MdxPlanPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">路线图</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">下一步，是内容系统。</h1>
      <div className="mt-8 space-y-5 text-base leading-8 text-black/68 dark:text-white/68">
        <p>下一次真正有价值的升级，是把当前本地数据迁移到基于 MDX 的文章系统，并配合 frontmatter 元信息。</p>
        <p>这样写作、版本管理和发布会比把文章内容塞在 TypeScript 数组里自然得多，也更适合长期维护。</p>
        <p>等 MDX 跑通之后，现在这个轻量控制台就可以继续长成真正的作者工作台。</p>
      </div>
    </div>
  );
}
