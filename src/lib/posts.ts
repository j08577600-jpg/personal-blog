export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
  content: string[];
};

export const posts: Post[] = [
  {
    slug: "building-with-agents",
    title: "Building With Agents, Without Losing the Plot",
    excerpt:
      "Agent workflows are powerful, but only when planning, scope control, and review stay in the loop.",
    date: "2026-03-22",
    readingTime: "5 min read",
    tags: ["Agents", "Workflow", "Engineering"],
    content: [
      "The promise of agentic development is speed, but speed without structure quickly turns into noise.",
      "The practical pattern is not one super-agent doing everything. It is a narrow loop: clarify, explore, plan, implement, verify, review.",
      "The more expensive the mistake, the less autonomy you should allow. Strong process beats magical thinking.",
    ],
  },
  {
    slug: "why-minimal-interfaces-last",
    title: "Why Minimal Interfaces Age Better",
    excerpt:
      "A personal site should make reading feel easy. Visual confidence comes from restraint, not decoration.",
    date: "2026-03-18",
    readingTime: "4 min read",
    tags: ["Design", "UI", "Writing"],
    content: [
      "Most personal sites get worse when they try too hard. Too many effects compete with the content.",
      "Good visual systems use spacing, type, and contrast to create rhythm. Once the basics are right, you need far less ornament.",
      "A simple layout also makes iteration cheaper. That matters when the site is going to evolve in public.",
    ],
  },
  {
    slug: "notes-from-early-blog-architecture",
    title: "Notes From Early Blog Architecture",
    excerpt:
      "The best first version is one that can ship quickly and still leave room for a better second system.",
    date: "2026-03-12",
    readingTime: "6 min read",
    tags: ["Architecture", "Next.js", "Blog"],
    content: [
      "Version one should be biased toward clarity: static content, simple routes, and small surface area.",
      "Adding authentication early only makes sense if it serves a real publishing need. Otherwise it is just scope inflation.",
      "The right way to grow is in stages: publish first, systematize later.",
    ],
  },
];

export function getPosts() {
  return posts;
}

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}
