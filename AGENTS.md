<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 项目规范 — 博客 (personal-blog)

## 1. 技术栈

- Next.js 16 App Router（React 19）
- TypeScript（strict 模式）
- Tailwind CSS 4
- NextAuth v4（JWT session）
- MDX 内容源：`content/posts/*.mdx`
- 环境变量存 `.env.local`

**V1 禁止**：为未来扩展提前抽象数据库层。内容只走文件。

---

## 2. 目录结构

```
src/
  app/           → 页面（page.tsx / layout.tsx / route.ts）
  components/    → UI 组件（kebab-case）
  lib/           → 工具函数（posts.ts, auth.ts）
  types/         → 类型扩展

content/posts/   → MDX 文章

public/         → 静态资源
certs/          → 证书
deploy/         → nginx 配置
.agent/         → 协作规范
docs/           → 文档
```

---

## 3. 文件命名

| 类型 | 约定 |
|------|------|
| 页面 | `page.tsx` |
| 动态路由 | `[slug]/page.tsx` |
| API | `route.ts` |
| UI 组件 | `kebab-case.tsx` |
| 工具 | `camelCase.ts` |

别名：`@/` = `src/`，`@/components/` = `src/components/`。

---

## 4. 组件规则

- 默认 Server Component，`async function`
- 需要交互（onClick / useState）才加 `"use client"`
- 组件不超过 200 行，超过就拆分
- 不用行内样式，全用 Tailwind class

---

## 5. MDX 文章规范

文件名：`yyyy-MM-dd_slug.mdx`

Frontmatter 必须包含：

```yaml
---
title: 文章标题
date: yyyy-MM-dd
slug: url-slug
excerpt: 摘要（用于列表展示）
tags: [标签1, 标签2]
published: true   # true=发布，false=草稿
---
```

约束：`slug` 与文件名一致；`published: true` 才出现在列表。

---

## 6. TypeScript 规范

- `strict: true`
- 禁止 `any`，用 `unknown` 代替
- 函数返回值必须有类型注解
- 所有组件 Props 必须有类型

---

## 7. Git 提交规范

格式：

```
<type>: <简短描述>

<详细说明>
```

类型前缀：`feat:` `fix:` `docs:` `refactor:` `style:` `test:` `chore:` `perf:`

---

## 8. 构建检查

每次 commit 前必须：

```bash
npm run lint
npm run build
```

**生产代码禁止 `console.log`**

---

## 9. 开发流程

### 什么时候必须走 Plan

- 跨 2 个及以上文件
- 涉及认证 / 发布 / SEO / 内容结构 / UI 改版 / 重构
- 预计超过 30 分钟的任务

### 阶段流转

P1 方案设计 → P2 执行计划 → P3 实现开发 → P4 交叉审查 → P5 测试验收 → P6 发布合并

### 强约束

- 无 Plan 不进入开发
- 无验收标准不进入实现
- 未过审不进入测试
- 未通过测试不进入发布

### 角色分工

- `planner-codex`：方案 / 执行计划
- `designer-gemini`：UI / 交互 / 文案（涉及 UI 时先行）
- `builder-codex`：主开发
- `reviewer-codex`：主审
- `reviewer-gemini`：二审 / 补盲
- `tester-codex`：测试 / 验收

---

## 10. 参考文档

- 完整协作规范：`.agent/OPENCLAW_WORKFLOW.md`
- 角色定义：`.agent/roles/`
- 模板：`.agent/templates/`
- 详细技术文档：`docs/技术框架与代码规范.md`
