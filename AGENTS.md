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
- `reviewer-codex`：主审
- `reviewer-gemini`：二审 / 补盲
- `tester-codex`：测试 / 验收

各角色定义见 `.agent/roles/`。

## 阶段流转

1. **P1 方案设计** → 输出 `方案设计.md`
2. **P2 执行计划** → 输出 `执行计划.md`（无 Plan 不进入开发）
3. **P3 实现开发** → 持续更新 Plan
4. **P4 交叉审查** → 输出 `审查报告.md`（未过审不进入测试）
5. **P5 测试验收** → 输出测试结果（未通过不发布）
6. **P6 发布合并**

## 强约束

- 无验收标准，不进入实现
- 未过审，不进入测试
- 未通过测试，不进入发布
- 实施过程中必须持续更新 Plan

## 参考文档

- 完整规范：`.agent/OPENCLAW_WORKFLOW.md`
- 角色定义：`.agent/roles/`
- 模板：`.agent/templates/`
