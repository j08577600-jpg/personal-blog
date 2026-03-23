# 文章预览页 — Task C 执行计划

> 日期：2026-03-23
> 任务：文章预览页（Feature C）
> 状态：已完成

## 目标

为作者提供草稿文章的私密预览能力。通过 `/dashboard/preview/[slug]` 路由，作者可在浏览器中查看 `published: false` 的 MDX 文章完整渲染结果，且不影响公开页面。

## 上下文

- 前置任务：Task B（内容工作台）提供了 dashboard 和 `getAllPostEntries()`
- 认证体系：NextAuth v4 + GitHub OAuth + 白名单（`whitelisted` flag）
- 内容层：`src/lib/posts.ts` — `getAllPostEntries()` 返回所有条目（含 drafts）
- 路由约定：`/dashboard/*` 为受保护作者路由，`/blog/*` 为公开路由

## 验收标准

- [x] 草稿文章在 dashboard 有"预览 →"链接
- [x] `/dashboard/preview/[slug]` 渲染完整 MDX 内容
- [x] 未登录用户访问 → redirect `/login`
- [x] 未授权用户访问 → redirect `/unauthorized`
- [x] 预览页不出现于公开 `/blog` 列表或 sitemap
- [x] 预览页带有明确"预览模式"提示 banner
- [x] `npm run lint` 通过
- [x] `next build` 通过（含 `/dashboard/preview/[slug]` 路由）

## 变更摘要

### src/app/dashboard/preview/[slug]/page.tsx（新建）
- Auth guard：未登录 → `/login`，未授权 → `/unauthorized`
- 从 `getAllPostEntries()` 按 slug 查找文章（覆盖所有状态）
- `notFound()` 处理文章不存在
- 顶部黄色预览 Banner：提示"预览模式 · 草稿不会对外公开"，含返回工作台链接
- 文章页眉：标题/日期/阅读时间/Tags（与 `/blog/[slug]` 风格一致）
- 底部返回链接
- `generateMetadata()` 输出 `[预览] ${title}` 便于识别

### src/app/dashboard/page.tsx（修改）
- `PostRow` 组件：在草稿行添加"预览 →"链接，指向 `/dashboard/preview/${post.slug}`

## 决策日志

- Decision: 预览路由放在 `/dashboard/preview/` 而非 `/preview/`
  原因：保持作者路由统一在 `/dashboard/` 前缀下，复用同一套 auth guard 逻辑
  日期/作者：2026-03-23 / builder-subagent

- Decision: 不使用 `generateStaticParams` 预渲染 preview 路由
  原因：草稿数量少且动态变化，SSR 按需渲染更合适
  日期/作者：2026-03-23 / builder-subagent

- Decision: 不构建在线编辑器
  原因：V1 禁止 CMS；作者直接在 `content/posts/*.mdx` 编辑文件，刷新预览
  日期/作者：2026-03-23 / builder-subagent

## 安全设计

| 路由 | 公开可见 | 保护方式 |
|------|----------|---------|
| `/blog/[slug]` | ✅ 仅 published | `getPostBySlug()` 只返回 published |
| `/blog` 列表 | ✅ 仅 published | `getPosts()` 只返回 published |
| `/dashboard/preview/[slug]` | ❌ | NextAuth session + whitelisted check |
| `/dashboard` | ❌ | NextAuth session + whitelisted check |

## 验证结果

```
npm run lint  → 通过（无输出，无 error）
next build    → ✓ Compiled / ✓ TypeScript / ✓ Generating (25/25 routes)
```

**新增路由：**
```
ƒ /dashboard/preview/[slug]  180 B  106 kB
```

## 提交信息

```
feat: add author-side draft preview via /dashboard/preview/[slug]

- Protected route requires auth + whitelist (reuse existing guards)
- Shows full MDX render with amber preview-mode banner
- Preview link added to dashboard PostRow for draft posts
- V1: no online editor, author edits MDX files directly
- Drafts never appear on public /blog routes or sitemap
```
