# OpenClaw 项目协作规范 v1

## 1. 框架

- Next.js
- Tailwind
- NextAuth
- MDX
- 先文件驱动，后数据库增强
- V1 禁止为了“未来扩展”提前抽象数据库层
- V1 内容源只认 `content/posts/*.mdx`

---

## 2. Agents

- `planner-codex`：方案 / Plan 负责人
- `designer-gemini`：UI / 交互 / 文案层
- `builder-codex`：主开发（前后端一体）
- `reviewer-codex`（主审）、`reviewer-gemini`（二审）：交叉审查
- `tester-codex`：测试 / 验收

---

## 3. Phases

### P1 方案设计

**文档：**
`yyyy-MM-dd_[功能]_方案设计.md`

**输出：**
- 方案结论
- 边界与约束
- 风险与取舍

---

### P2 执行计划

**文档：**
`yyyy-MM-dd_[功能]_执行计划.md`

**要求：**
- 无 Plan 不进入开发

**输出：**
- 自包含的执行计划（ExecPlan）
- 实施步骤
- 验收标准
- 恢复点说明

---

### P3 实现开发

**输出：**
- 代码
- Plan 更新记录

**要求：**
- 实施过程中持续更新 Plan
- 每个停止点必须更新：进度、决策日志、验证记录

---

### P4 交叉审查

**文档：**
`yyyy-MM-dd_[功能]_审查报告.md`

主审、二审、三审**并行进行**，由编排者汇总结论。

**输出：**
- 审查结论
- 修改意见

**要求：**
- 未过审不得进入测试

---

### P5 测试验收

**文档：**
测试计划，至少包含：
- 单元测试
- 冒烟测试
- 功能测试
- 回归测试

每一项测试都有状态，待测试：`[ ]`，通过：`[✔]`

**要求：**
- 测试未通过不得发布

**输出：**
- 测试结果
- 问题记录
- 是否允许发布

---

### P6 发布 / 合并

详见 `.agent/workflow/P6_发布合并工作流.md`，核心步骤：

1. **收集阶段文档**：确认 P1/P2/P4/P5 文档齐全
2. **生成最终报告**：汇总所有阶段，输出 `P6_最终报告.md`（可转 PDF）
3. **Git 合并**：切 main → 拉取 → 合并功能分支 → 推送
4. **发布**：lint / build → PM2 重启（或对应部署方式）
5. **收尾**：更新 DEVELOPMENT_PLAN.md → 向编排者汇报完成

**负责人：**
- `planner-codex`：P6 收口、汇总最终报告、做架构一致性判断
- 编排者（Dyna）：负责派活、跟踪、协调与对外汇报
- builder-codex：执行 Git 合并和发布操作

**输出：**
- `yyyy-MM-dd_[功能]_最终报告.pdf`
- Git 合并完成
- 生产环境发布完成

---

## 4. 模型分工

### Codex

负责：
- 方案设计
- Plan 编写（实施计划）
- 编码实现
- Bug 修复
- 技术主审
- 测试
- 最终落地

### Gemini

负责：
- UI / 交互方向提案
- 页面结构
- 文案
- 技术二审

---

## 5. 任务编排策略

### 小任务

直接主 agent 处理。

适用于：
- 单文件小修改
- 明确且低风险的修复
- 不需要复杂上下文的简单任务

### 多功能并行策略

**模式 A（不同功能并行，默认）：**
当多个独立功能同时开发时，按功能并行，而不是把同一个功能拆成多个阶段并行。

规则：
- 最多同时开启 **4 路子 agent**
- **并行单位 = 不同功能**
- 超过 4 个功能时，其余功能先排队
- 每个功能各自开发、各自汇报
- 由 `tester-codex` 负责测试验收
- 由 `planner-codex` 负责最终收口、汇总与架构一致性判断

简化约束：
- 明显属于同一个功能的，不硬拆
- 明显会改同一个核心文件的，不同时开做

### 中大型任务

按第 3 节阶段流转：

1. `planner-codex` 出 Plan
2. `builder-codex` 实现
3. `reviewer-codex`、`reviewer-gemini` 审核
4. `tester-codex` 验收
5. `planner-codex` 负责最终收口、汇总与架构一致性判断

### 涉及 UI 的任务

顺序为：

1. `designer-gemini`
2. `planner-codex`
3. `builder-codex`

说明：
- 先由 Gemini 发散 UI / 交互方向
- 再由 Codex 收敛为可执行方案与 Plan
- 最后进入开发实现

---

## 6. 执行计划（ExecPlan）

复杂功能或重要改动，必须使用执行计划。具体格式由 `PLAN.md` 定义。

### ExecPlan 原则

- ExecPlan 驱动
- 先 Plan 后开发
- Plan 自包含
- Plan 持续更新
- 可中断恢复
- 有验收标准

### 实施要求

实施前：
- 起草执行计划（必须自包含）

实施中：
- 保持计划实时更新

每个停止点：
- 更新进度
- 写决策日志
- 写相关验证记录

### 最低要求

任何 ExecPlan 至少要包含：
- 目标
- 上下文
- 执行步骤
- 验收标准
- 恢复方式

---

## 7. 规则

- 复杂功能、大型重构，必须先有 ExecPlan
- 无 Plan，不进入开发
- 无验收标准，不进入实现
- 未过审，不进入测试
- 未通过测试，不进入发布

### V1 特别规则

- 不为了未来扩展提前抽象数据库层
- 不提前做完整 CMS
- 内容系统只认 `content/posts/*.mdx`
- 优先完成发布链路，再逐步增强后台能力

---

## 8. 模板位置

- `.agent/templates/方案设计模板.md`
- `.agent/templates/执行计划模板.md`
- `.agent/templates/审查报告模板.md`
- `.agent/templates/测试计划模板.md`

## 9. 任务文档位置

`.agent/tasks/`

## 10. Agent 系统

博客项目使用项目级 sub-agent 协作（sessions_spawn 派生子 agent）：

| 角色 | 模型 | 定义位置 |
|------|------|---------|
| planner-codex | crs/claude-opus-4-6 | .agent/roles/planner.md |
| builder-codex | crs/claude-opus-4-6 | .agent/roles/builder.md |
| reviewer-codex | crs/claude-opus-4-6 | .agent/roles/reviewer-codex.md |
| reviewer-gemini | crs/claude-sonnet-4-6 | .agent/roles/reviewer-gemini.md |
| tester-codex | crs/claude-sonnet-4-6 | .agent/roles/tester.md |
| designer-gemini | crs/claude-sonnet-4-6 | .agent/roles/designer-gemini.md |

编排者（Dyna）通过 `sessions_spawn` 派活，各子 agent 在自己的角色定义下工作，工作区共享项目目录。
na）通过 `sessions_spawn` 派活，各子 agent 在自己的角色定义下工作，工作区共享项目目录。
