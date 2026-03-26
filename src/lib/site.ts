// ---------------------------------------------------------------------------
// Site-wide configuration — single source of truth for URLs and identity
// ---------------------------------------------------------------------------

export const siteConfig = {
  /** Full production URL, used for canonical URLs and Open Graph */
  siteUrl: "https://blog.chenjilan.com",

  /** Site name shown in metadata */
  name: "jay / 个人博客",

  /** Default site description */
  description:
    "极简技术博客，记录工程实践、项目进展和 Agent 工作流。",

  /** Short tagline for homepage */
  tagline: "一个安静、清楚的空间，记录工程与思考。",

  /** Primary author */
  author: {
    name: "jay",
    github: "https://github.com/j08577600-jpg",
  },

  analytics: {
    provider: "manual",
    dashboardPath: "/dashboard/ops",
    note: "当前仅提供最小接入位与运行说明；待统一内容模型和真实流量后，再决定是否接 Plausible / Umami。",
  },

  feedback: {
    email: "hi@chenjilan.com",
    note: "当前阶段先用邮件收集勘误、合作与阅读反馈，不做评论系统。",
  },

  navigation: [
    { href: "/blog", label: "博客" },
    { href: "/projects", label: "项目" },
    { href: "/blog/tags", label: "标签" },
    { href: "/about", label: "关于" },
  ],
} as const;
