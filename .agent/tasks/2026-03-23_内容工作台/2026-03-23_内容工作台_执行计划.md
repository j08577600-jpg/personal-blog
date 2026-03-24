# 内容工作台 — Task B 执行计划

> 日期：`2026-03-23`
> 任务：内容工作台（Dashboard 内容化）
> 状态：已完成

## 目标

将作者仪表盘从身份展示页升级为内容工作空间，让作者能够一目了然地看到所有文章的发布状态（已发布、草稿、待修复）。

## 上下文

- 前置任务：Task A（作者白名单接入）提供了认证/授权守卫
- 数据层：`src/lib/posts.ts` 已有 `getAllPostEntries()`，返回 `PostEntry[]` 含 status
- 风格约束：复用现有 dashboard UI 组件风格，不引入新设计系统

## 验收标准

- [x] 已登录用户访问 `/dashboard` 重定向至工作台（非身份页）
- [x] 页面显示三类统计：已发布、草稿、待修复
- [x] 每类文章以卡片列表展示，包含标题/日期/阅读时间
- [x] 无效文章显示错误原因
- [x] 未授权用户访问 `/dashboard` 重定向 `/unauthorized`
- [x] 未登录用户访问 `/dashboard` 重定向 `/login`
- [x] `npm run lint` 通过
- [x] `npx tsc --noEmit` 通过
- [x] `npx next build` 通过

## 变更摘要

### src/app/dashboard/page.tsx（重写）
- 标题改为"内容工作台"，含用户名招呼
- 引入 `getAllPostEntries()` 获取所有文章条目
- 新增 `StatCard` 组件：已发布(绿)/草稿(黄)/待修复(红)统计卡
- 新增 `PostSection` 组件：按状态分组展示文章列表
- 新增 `PostRow` 组件：单篇文章行（支持 invalid 状态错误提示）
- 新增 `EmptyState` 组件：无文章时的引导状态
- 保留用户信息侧边栏（显示身份信息）
- 保留写作提示侧边栏（content/posts/ 路径规范）

### src/lib/posts.ts（补充）
- `PostEntry` 类型：含 `fileName / status / post / validationError`
- `PostStatus` 类型：`"published" | "draft" | "invalid"`
- `getAllPostEntries()`：返回全部条目，含 invalid（按 invalid→draft→published + date desc 排序）
- `getAllValidPosts()`：仅返回有效文章（published + draft）

## 决策日志

- Decision: 不引入数据库或 CMS，直接复用现有 `getAllPostEntries()` 和文件系统
  原因：保持 V1 简单，MDX frontmatter + Zod 验证已足够
  日期/作者：2026-03-23 / builder-subagent

## 意外与发现

- 观察：dashboard 和 posts 模块已由前序尝试部分实现，包含完整的统计、列表、invalid 处理
  证据：`src/app/dashboard/page.tsx` 已包含 StatCard / PostSection / PostRow 等组件
  日期：2026-03-23

## 验证结果

```
npm run lint  → 通过（无输出）
npx tsc --noEmit → 通过（无输出）
npx next build → ✓ Compiled / ✓ TypeScript / ✓ Generating (13/13)
```

## 提交信息

```
feat: upgrade dashboard to content workspace

- Show published posts, drafts, and invalid items with status
- Add stats row (count per status) with color-coded cards
- Show validation errors for invalid MDX frontmatter
- Keep auth/whitelist guardrails via existing session checks
- V1: file-driven, no DB/CMS, reuse getAllPostEntries()
```
