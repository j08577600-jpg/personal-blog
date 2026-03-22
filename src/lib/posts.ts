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
    slug: "agent-gongzuoliu-yu-bianjie",
    title: "Agent 工作流的价值，不在于放飞，而在于边界",
    excerpt: "Agent 开发真正有价值的地方，不是自动化表演，而是把规划、范围控制和审查纳入稳定流程。",
    date: "2026-03-22",
    readingTime: "5 分钟阅读",
    tags: ["Agent", "工作流", "工程"],
    content: [
      "Agent 式开发最诱人的地方是速度，但速度一旦脱离结构，很快就会退化成混乱。",
      "真正可落地的模式，从来不是一个超级 Agent 包打天下，而是一个更窄、更稳的闭环：澄清、探索、规划、实现、验证、审查。",
      "任务越昂贵、错误代价越高，越不该把控制权全部交出去。严谨的流程，永远比对神奇自动化的幻想更可靠。",
    ],
  },
  {
    slug: "weishenme-jijian-jiemian-geng-naikan",
    title: "为什么极简界面通常更耐看",
    excerpt: "个人网站最重要的不是装饰，而是让阅读毫不费力。真正的视觉自信，往往来自克制。",
    date: "2026-03-18",
    readingTime: "4 分钟阅读",
    tags: ["设计", "界面", "写作"],
    content: [
      "很多个人站会越做越重，不是因为内容更多，而是因为设计开始抢内容的注意力。",
      "好的视觉系统依赖的是留白、字号、层次和对比，而不是堆叠效果。基础做对了，装饰自然可以少很多。",
      "一个更克制的界面也更适合长期迭代。你会更容易持续调整它，而不是每改一次都像在拆一栋楼。",
    ],
  },
  {
    slug: "zaoqi-boke-jiegou-biji",
    title: "早期博客架构的一些笔记",
    excerpt: "第一版最好的状态，不是功能齐全，而是尽快可上线，同时还给第二版留下足够空间。",
    date: "2026-03-12",
    readingTime: "6 分钟阅读",
    tags: ["架构", "Next.js", "博客"],
    content: [
      "版本一应该偏向清晰：静态内容、简单路由、小而稳的表面积。",
      "认证系统如果太早做重，常常会把博客项目带偏。只有当它真正服务发布流程时，它才值得被放进核心路径。",
      "更好的成长方式是分阶段：先发布，再系统化；先跑通，再做重。",
    ],
  },
];

export function getPosts() {
  return posts;
}

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}
