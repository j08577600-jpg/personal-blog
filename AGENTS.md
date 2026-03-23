<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# OpenClaw 协作规范

## 触发规则：什么时候必须走 Plan

必须走 ExecPlan 的情况：
- 跨 2 个及以上文件
- 涉及页面 + 数据 + 交互任意两项
- 涉及认证、发布、SEO、内容结构、UI 改版、重构、测试补齐
- 预计超过 30 分钟的任务

可直接处理的小任务：
- 单文件文案改动
- 样式微调
- 明确的小 bug
- 小型配置改动

## 角色分工

- `planner-codex`：方案 / 执行计划
- `designer-gemini`：UI / 交互 / 文案（涉及 UI 时先行）
- `builder-codex`：主开发
- `reviewer-codex`：技术主审
- `reviewer-gemini`：二审 / 补盲
- `reviewer-minimax`：第三视角审查
- `tester-codex`：测试 / 验收

各角色定义见 `.agent/roles/`。

## 阶段流转

1. **P1 方案设计** → 输出 `方案设计.md`
2. **P2 执行计划** → 输出 `执行计划.md`（无 Plan 不进入开发）
3. **P3 实现开发** → 持续更新 Plan
4. **P4 交叉审查** → 输出 `审查报告.md`（三审：codex 主审 + gemini 二审 + minimax 三审；未过审不进入测试）
5. **P5 测试验收** → 输出测试结果（未通过不发布）
6. **P6 发布合并**

## 强约束

- 无验收标准，不进入实现
- 未过审，不进入测试
- 未通过测试，不进入发布
- 实施过程中必须持续更新 Plan

## 模型分工

- **Codex**：方案设计、Plan 编写、编码实现、Bug 修复、技术主审、测试、最终落地
- **Gemini**：UI / 交互方向提案、页面结构、文案、技术二审
- **MiniMax**：第三视角审查、安全与风险判断、中文表达与逻辑审查

## 任务编排策略

- **小任务**：主 agent 直接处理
- **中大型任务**：planner → builder → reviewer → tester
- **涉及 UI 的任务**：designer-gemini → planner-codex → builder-codex

## 参考文档

- 完整规范：`.agent/OPENCLAW_WORKFLOW.md`
- 角色定义：`.agent/roles/`
- 模板：`.agent/templates/`

---

# 项目规范 — 博客 (personal-blog)

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
