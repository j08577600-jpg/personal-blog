export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="mb-4 text-sm uppercase tracking-[0.22em] text-black/38 dark:text-white/38">关于</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">一个为清晰表达而建的个人站点。</h1>
      <div className="mt-8 space-y-6 text-base leading-8 text-black/68 dark:text-white/68">
        <p>这个博客用来发布技术笔记、项目更新、设计决策，以及那些值得长期保留的思考。</p>
        <p>整体语气会保持克制。页面更重视排版、留白、可读性，以及一个能持续扩展但不变乱的结构。</p>
        <p>长期方向很简单：写得更好，发布更稳定，把正在做的事情沉淀成可复用的知识。</p>
      </div>
    </div>
  );
}
