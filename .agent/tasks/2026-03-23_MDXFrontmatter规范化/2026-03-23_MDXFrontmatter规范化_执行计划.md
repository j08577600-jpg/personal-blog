# MDX Frontmatter 规范化 — 执行计划

| 字段 | 内容 |
|------|------|
| 日期 | 2026-03-23 |
| 角色 | builder |
| 状态 | 执行完成 ✅ |
| 对应方案 | `2026-03-23_MDXFrontmatter规范化_方案设计.md` |

---

## 1. 目标

将 MDX frontmatter 的结构规范从"文档层描述"提升为"代码层强制"，消除解析时的隐式默认值兜底，确保所有文章在读取时即完成验证，不合规文章直接报错而非静默降级。

---

## 2. 验收标准

| # | 标准 |
|---|------|
| 1 | `npm run build` 成功 |
| 2 | `npm run lint` 无 error |
| 3 | `published: true` 文章正常显示在 `/blog` |
| 4 | `published: false` 文章不显示在 `/blog`，但出现在 dashboard |
| 5 | frontmatter 不完整的文章不显示在 `/blog`，出现在 dashboard 并标注错误 |
| 6 | `getAllPostEntries()` 在 dashboard 中正确分类 posts/drafts/invalid |

---

## 3. 进度

- [x] Step 1: 安装 Zod ✅
- [x] Step 2: 重写 `src/lib/posts.ts`（Zod schema + dashboard 函数）✅
- [x] Step 3: 更新 `src/app/dashboard/page.tsx`（内容工作台）✅
- [x] Step 4: 添加 draft 示例 MDX ✅
- [x] Step 5: 添加 invalid 示例 MDX（用于测试）✅
- [x] Step 6: Build + Lint 验证 ✅
- [x] Step 7: Commit ✅

---

## 4. 实施步骤

### Step 1: 安装 Zod

```bash
npm install zod
```

---

### Step 2: 重写 `src/lib/posts.ts`

**新增内容**：
- `PostFrontmatterSchema` — Zod schema，运行时验证 frontmatter
- `PostStatus` — `"published" | "draft" | "invalid"`
- `PostEntry` — 带状态和错误信息的条目（dashboard 用）
- `getAllPostEntries()` — 返回所有条目含状态（dashboard 专用）
- `getAllValidPosts()` — 返回所有有效 posts（published + drafts）
- `parseAndValidate()` — 内部函数，解析 + Zod 验证

**保留内容**：
- `getPosts()` — 公开安全 API，只返回 valid + published（不变）
- `getPostBySlug()` — 公开安全 API（不变）

**关键设计**：
- `published` 无默认值，缺失则验证失败 → invalid
- 验证失败返回 `{ post: null, error: string }`
- `getPosts()` 过滤掉 error 的条目（保持公开页面安全）

---

### Step 3: 更新 dashboard

**新增内容**：
- 调用 `getAllPostEntries()` 获取所有条目
- 分三类展示：已发布、草稿、待修复
- 顶部统计卡片（数量）
- 待修复条目显示具体验证错误信息
- 草稿不显示公开链接，已发布显示"查看 →"

---

### Step 4–5: 添加示例 MDX

- `content/posts/2026-03-23_draft-test-zuopin-kuangjia-sikao.mdx` — `published: false`
- `content/posts/2026-03-23_bad-invalid-example.mdx` — 缺少 `excerpt`（invalid）

---

### Step 6: Build + Lint

```bash
npm run lint
npm run build
```

---

## 5. 决策日志

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-03-23 | Zod schema 放在 `posts.ts` 内 | V1 保持单文件简单，不拆分独立 schema 文件 |
| 2026-03-23 | `published` 无默认值 | 方案设计明确要求"显式要求"，缺失即为 invalid |
| 2026-03-23 | `getAllPostEntries()` 返回 `PostEntry[]` | 同时携带 status + error，dashboard 渲染更方便 |
| 2026-03-23 | dashboard 只在 `getAllPostEntries()` 中可见 | 公开路由继续用 `getPosts()`，invalid 文章不影响公网 |

---

## 6. 意外发现

| 发现 | 影响 |
|------|------|
| 之前 `parsePost` 使用 `??` 默认值掩盖了缺失字段 | 修复后，缺少 excerpt 的文章正确标记为 invalid |
| dashboard 需要导入 `PostStatus` 类型 | 通过 named export `export type { PostStatus }` 暴露 |

---

## 7. 恢复方式

| 场景 | 恢复方式 |
|------|----------|
| build 失败 | 检查 Zod schema 是否与 `Post` 类型字段一致 |
| dashboard 报错 | 确认 `getAllPostEntries` 返回类型正确 |
| invalid 文章意外出现在 blog | `getPosts()` 已过滤所有 error 条目，不会出现 |
| 误删 Zod | `npm install zod` 重新安装 |
