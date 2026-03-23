# OpenClaw 项目协作规范 v1

## 1. 框架

- Next.js
- Tailwind
- NextAuth
- MDX
- 先文件驱动，后数据库增强
- V1 禁止为了“未来扩展”提前抽象数据库层
- V1 内容源只认 `content/posts/*.mdx`

## 2. Agents

- `planner-codex`：方案 / Plan 负责人
- `designer-gemini`：UI / 交互 / 文案层
- `builder-codex`：主开发（前后端一体）
- `reviewer-codex`（主审）、`reviewer-gemini`（二审）：交叉审查
- `tester-codex`：测试 / 验收

各角色定义见 `.agent/roles/` 目录。

## 3. Phases

### P1 方案设计
- 文档：`yyyy-MM-dd_[功能]_方案设计.md`
- 要求：无方案不进入 Plan

### P2 执行计划
- 文档：`yyyy-MM-dd_[功能]_执行计划.md`
- 要求：无 Plan 不进入开发

### P3 实现开发
- 输出：代码 + Plan 更新记录
- 要求：每个停止点必须更新进度、决策日志、验证记录

### P4 交叉审查
- 文档：`yyyy-MM-dd_[功能]_审查报告.md`
- 要求：未过审不得进入测试

### P5 测试验收
- 文档：测试计划 + 结果记录
- 要求：未通过不得发布

### P6 发布 / 合并
- 输出：合并、发布、收尾总结

## 4. 模型分工

### Codex
方案设计、Plan 编写、编码实现、Bug 修复、技术主审、测试、最终落地。

### Gemini
UI / 交互方向提案、页面结构、文案、技术二审。

## 5. 任务编排策略

### 小任务
主 agent 直接处理（单文件小修改、明确低风险修复、小型配置改动）。

### 中大型任务
planner → builder → reviewers → tester

### 涉及 UI 的任务
designer-gemini → planner-codex → builder-codex

## 6. ExecPlan 规范

详见 `.agent/roles/planner.md`。

## 7. 规则

- 复杂功能、大型重构，必须先有 ExecPlan
- 无 Plan，不进入开发
- 无验收标准，不进入实现
- 未过审，不进入测试
- 未通过测试，不进入发布

## 8. 模板位置

- `.agent/templates/方案设计模板.md`
- `.agent/templates/执行计划模板.md`
- `.agent/templates/审查报告模板.md`
- `.agent/templates/测试计划模板.md`

## 9. 任务文档位置

`.agent/tasks/`
