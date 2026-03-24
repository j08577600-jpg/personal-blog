<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# OpenClaw 协作规范

## OpenClaw 项目协作规范

完整规范见：`.agent/OPENCLAW_WORKFLOW.md`

规范要点：
- 阶段流转：P1 → P2 → P3 → P4 → P5 → P6
- 无 Plan 不开发，无审查通过不测试，无测试通过不发布
- 回流规则：P4/P5 发现严重问题时回流 P1/P2 重做
- 规范源：`.agent/OPENCLAW_WORKFLOW.md`（唯一权威）

## 参考文档

- 完整规范：`.agent/OPENCLAW_WORKFLOW.md`
- 角色定义：`.agent/roles/`
- 模板：`.agent/templates/`

---

# 项目规范 - 博客 (personal-blog)

## 技术栈

- Next.js 16 App Router（React 19）
- TypeScript（strict 模式）
- Tailwind CSS 4
- NextAuth v4（JWT session）
- MDX 内容源：`content/posts/*.mdx`
- 环境变量存 `.env.local`

**V1 禁止**：为未来扩展提前抽象数据库层。内容只走文件。

## 目录结构

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

别名：`@/` = `src/`，`@/components/` = `src/components/`。

## 文件命名

| 类型 | 约定 |
|------|------|
| 页面 | `page.tsx` |
| 动态路由 | `[slug]/page.tsx` |
| API | `route.ts` |
| UI 组件 | `kebab-case.tsx` |
| 工具 | `camelCase.ts` |

## 组件规则

- 默认 Server Component，`async function`
- 需要交互（onClick / useState）才加 `"use client"`
- 组件不超过 200 行，超过就拆分
- 不用行内样式，全用 Tailwind class

## MDX 文章规范

文件名：`yyyy-MM-dd_slug.mdx`

Frontmatter 必须包含：`title`、`date`、`slug`、`excerpt`、`tags`、`published`

## 构建检查

每次 commit 前必须：

```bash
npm run lint
npm run build
```

**生产代码禁止 `console.log`**
