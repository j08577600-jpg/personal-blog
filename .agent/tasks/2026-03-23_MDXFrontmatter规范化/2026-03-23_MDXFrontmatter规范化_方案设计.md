# MDX Frontmatter 规范化方案设计

> 日期：2026-03-23
> 任务：MDX Frontmatter 规范化
> 负责人：planner-codex

---

## 1. 目标

将 MDX frontmatter 的结构规范从"文档层描述"提升为"代码层强制"，消除解析时的隐式默认值兜底，确保所有文章在读取时即完成验证，不合规文章直接报错而非静默降级。

---

## 2. 背景

当前状态分析如下：

| 维度 | 现状 | 问题 |
|------|------|------|
| **文档层** | `docs/技术框架与代码规范.md` §5.2 已定义 schema | 规范存在但无代码约束力 |
| **类型层** | `Post` type 存在于 `posts.ts` | 仅供 TypeScript 编译期检查，MDX 为外部文件，数据来自运行时 |
| **解析层** | `parsePost` 使用 `??` 隐式兜底 | 缺字段时静默用空字符串/false 代替，不报错 |
| **验证层** | 无运行时验证 | 缺失必填字段、类型错误的 frontmatter 不会触发告警 |
| **草稿测试** | 无 `published: false` 示例 | 无法验证草稿逻辑的正确性 |

现有 3 篇 MDX 文章 frontmatter 均已合规，但这属于"偶然合规"而非"制度合规"——一旦新文章缺失必填字段，系统不会感知。

---

## 3. 范围

### 做
- 在 `src/lib/posts.ts` 中引入 **Zod** 运行时 schema 验证
- 定义 `PostFrontmatter` Zod schema，涵盖所有字段的运行时类型约束
- `parsePost` 解析失败时 throw Error（不再静默返回 null）
- 在 `docs/技术框架与代码规范.md` §5 补充 schema 验证说明
- 更新现有 3 篇 MDX 文章，确保 slug 与文件名一致
- 新增 `2026-03-23_draft-example.mdx`（`published: false`）

### 不做
- 不引入 pre-commit hook（V1 测试策略以手动验证为主）
- 不拆分独立的 schema 文件（posts.ts 自包含，V1 保持简单）
- 不修改 `next-mdx-remote` 渲染逻辑（解析层改动不影响渲染）

---

## 4. 技术选择

### 选项 A：纯 TypeScript 类型（现状）

**描述**：仅靠 TS interface + `??` 默认值。

**优点**：零依赖，零运行时开销。
**缺点**：MDX frontmatter 来自文件系统，是运行时数据。TypeScript 只在编译期有效，外部 MDX 文件的格式错误不会触发 TS 错误。`??` 默认值掩盖错误，使缺失字段静默变成空值。

**结论**：❌ 无法满足"强制验证"需求。

---

### 选项 B：Zod 运行时 Schema 验证（推荐）

**描述**：在 `posts.ts` 中定义 Zod schema，`parsePost` 解析后通过 schema 验证，失败时抛出明确的 Error。

```ts
import { z } from "zod";

const PostFrontmatterSchema = z.object({
  title: z.string().min(1, "title 不能为空"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date 格式须为 yyyy-MM-dd"),
  slug: z.string().min(1, "slug 不能为空"),
  excerpt: z.string().min(1, "excerpt 不能为空"),
  tags: z.array(z.string()),
  published: z.boolean(),
  cover: z.string().optional(),
});

type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;
```

**优点**：
- TypeScript 类型从 schema 自动推断（单一真相来源）
- 运行时验证，发现不合规 frontmatter 直接报错
- 错误信息明确指出哪个字段出问题
- Zod 是 Next.js 生态标准，体积可控（~12KB）

**缺点**：
- 引入 Zod 依赖（可接受，Next.js 生态广泛使用）

**结论**：✅ 最佳选择。TypeScript 类型 + 运行时验证双保险。

---

### 选项 C：JSON Schema + Ajv

**描述**：用 JSON Schema 描述 frontmatter，用 Ajv 做验证。

**缺点**：比 Zod 更冗长，TypeScript 集成不如 Zod 顺畅。**结论**：❌ 过度工程化。

---

## 5. 验证策略

### 5.1 字段约束明细

| 字段 | 类型 | 约束 |
|------|------|------|
| `title` | `string` | 必填，最小长度 1 |
| `date` | `string` | 必填，格式 `yyyy-MM-dd` |
| `slug` | `string` | 必填，非空；建议与文件名中的 slug 一致 |
| `excerpt` | `string` | 必填，最小长度 1 |
| `tags` | `string[]` | 必填，默认为 `[]` |
| `published` | `boolean` | 必填，无默认值（显式要求） |
| `cover` | `string` | 可选，URL 路径 |

### 5.2 验证失败策略

`parsePost` 解析失败时：
- **开发环境**（`NODE_ENV !== 'production'`）：`throw new Error(...)`，让 Next.js 错误边界捕获
- **生产环境**：记录日志，返回 `null`（不退机，但列表不展示）

> 生产环境偏保守，避免单篇坏文章导致整站 500。

---

## 6. 风险与取舍

| 风险 | 影响 | 应对 |
|------|------|------|
| Zod 依赖引入 | 轻微增加 bundle 大小（~12KB） | 可接受，V1 优先保证正确性 |
| 已有文章存在隐藏不合规 | 引入验证后可能报错 | 本次更新 3 篇 MDX 时同步检查 |
| 未来字段扩展 | schema 需同步维护 | 约定：新增可选字段加 `.optional()`，新增必填字段需同步更新文档和已有文章 |
| `getPostBySlug` slug 匹配逻辑 | 目前用 frontmatter 中的 slug，不校验与文件名一致性 | docs 补充说明"建议一致"，builder 实现时可选加 filename slug 对照检查 |

---

## 7. 结论

选定 **选项 B（Zod 运行时验证）**：

1. 在 `src/lib/posts.ts` 中引入 Zod schema，`Post` 类型从 schema 推断
2. `parsePost` 失败时抛出明确错误，开发环境立即感知问题
3. `docs/技术框架与代码规范.md` §5 补充 schema 验证说明和字段约束表
4. 更新现有 3 篇 MDX 确保全部合规
5. 新增一篇 `published: false` 草稿示例

此方案在 V1 简单性（单文件、无额外构建步骤）和健壮性（运行时验证）之间取得最佳平衡。
