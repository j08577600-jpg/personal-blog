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

- `planner-codex`：负责方案设计（P1）、执行计划（P2）、最终收口合并（P6）
- `designer-gemini`：UI / 交互 / 文案层
- `builder-codex`：负责实现开发（P3），并在实施过程中更新执行记录，不负责起草 P2
- `reviewer-codex`：技术主审
- `reviewer-gemini`：二审 / 补盲
- `reviewer-minimax`：第三视角审查
- `tester-codex`：测试 / 验收

各角色定义见 `.agent/roles/` 目录。

## 2.1 角色名 -> 模型映射（唯一真源）

映射文件：`.agent/config/role-models.json`

- `planner-codex` -> `crs-openai/gpt-5.4`
- `builder-codex` -> `crs-openai/gpt-5.4`
- `reviewer-codex` -> `crs-openai/gpt-5.4`
- `tester-codex` -> `crs-openai/gpt-5.4`
- `designer-gemini` -> `google/gemini-3.1-pro-preview`
- `reviewer-gemini` -> `google/gemini-3.1-pro-preview`
- `reviewer-minimax` -> `minimax-portal/MiniMax-M2.5-highspeed`

编排规则：
- 生成 sub-agent 时，必须先按角色名查 `.agent/config/role-models.json`
- `sessions_spawn` 时必须显式传入 `model`
- 禁止在任务文档、临时脚本或口头约定中绕过查表直接写模型
- 若角色未命中映射，必须报错并停止，不允许静默回退默认模型

## 3. Phases

### P1 方案设计
- 文档：`yyyy-MM-dd_[功能]_方案设计.md`
- 由 `planner-codex` 输出
- 无方案不进入 Plan

### P2 执行计划
- 文档：`yyyy-MM-dd_[功能]_执行计划.md`
- 由 `planner-codex` 输出
- 无 Plan 不进入开发
- `builder-codex` 不负责起草 P2

### P3 实现开发
- 输出：代码 + Plan 更新记录
- 由 `builder-codex` 按 P2 执行
- 每个停止点必须更新进度、决策日志、验证记录
- 不得擅自改写目标、范围、验收标准；若需变更，必须回到 `planner-codex`

### P4 交叉审查
- 文档：`yyyy-MM-dd_[功能]_审查报告.md`
- `reviewer-codex` 主审 + `reviewer-gemini` 二审 + `reviewer-minimax` 三审
- 三审并行进行，不串行等待
- 未过审不得进入测试

### P5 测试验收
- 文档：测试计划 + 结果记录
- 由 `tester-codex` 输出测试结果
- 未通过不得发布

### P6 发布 / 合并
- 输出：合并、发布、收尾总结
- 由 `planner-codex` 负责最终收口
- 按 `.agent/workflow/P6_发布合并工作流.md` 执行

### 3.7 P4/P5 回流规则

#### 回流触发条件

| 阶段 | 触发条件 | 回流目标 |
|------|----------|---------|
| P4 | 必改项 > 3 条，或存在方案根本性缺陷 | P1，重新设计 |
| P4 | 发现范围蔓延 | 新建独立任务 |
| P5 | 失败因方案设计遗漏 | P2，补充验收标准 |

#### 回流处理流程

1. reviewer / tester 在审查/测试报告中标记「回流」
2. 通知 planner-codex 介入
3. planner-codex 修订方案/计划，写入回流记录
4. builder-codex 按修订后的计划修复
5. 相关审查/测试报告追加「回流后复审」结论

#### 回流记录格式

在 `执行计划.md` 中增加：

```markdown
## 回流记录

| 日期 | 从 | 到 | 原因 | 决策 |
|------|----|----|------|------|
| yyyy-MM-dd | P4 | P1 | 方案存在根本缺陷 | 重新设计 X 模块 |
```

### 3.8 P6 md/pdf/merge/deploy 状态定义

| 状态 | 文件形式 | 触发时机 | 说明 |
|------|---------|---------|------|
| md | `yyyy-MM-dd_功能_最终报告.md` | P6 Step 2 | 唯一编辑来源 |
| pdf | `yyyy-MM-dd_功能_最终报告.pdf` | P6 Step 2 | md 等价归档，不单独维护 |
| merge | main 分支已推送 | P6 Step 3 | 必须无阻塞冲突 |
| deploy | 生产服务健康 | P6 Step 4 | pm2 restart 成功或等效操作 |

**约定**：
- md 和 pdf 内容等价，编辑源为 md
- 历史任务中出现的 `P6_最终报告.md` 应重命名为标准格式
- merge 是 deploy 的前置条件
- deploy 完成前不得更新 DEVELOPMENT_PLAN.md 为「已完成」

## 4. 模型分工

### Codex
方案设计、Plan 编写、编码实现、Bug 修复、技术主审、测试、最终落地。

### Gemini
UI / 交互方向提案、页面结构、文案、技术二审。

### MiniMax
第三视角审查、安全与风险判断、中文表达与逻辑审查。

## 5. 任务编排策略

### 小任务
主 agent 直接处理（单文件小修改、明确低风险修复、小型配置改动）。

### 多功能并行策略
- 当多个独立功能同时开发时，最多开启 4 路子 agent 并行推进
- 并行单位 = 不同功能
- 超过 4 个功能时，其余先排队

### 关键说明
- “并行”指的是**不同功能并行**，不是同一个功能拆成多个阶段并行
- 每个功能内部仍按角色流转：`planner -> builder -> reviewer -> tester -> planner`
- 不允许一个子 agent 包办同一功能的完整流程
- `planner` 负责该功能的计划发起、最终收口、汇总与架构一致性判断
- `tester` 负责测试验收
- 无 P1 / P2 文档，不进入该功能的开发阶段
- 一旦某功能进入阶段流转，在用户未叫停的前提下，编排者必须自动推进到下一角色，不停在 planner 完成后等待额外催促
- 开发过程中必须做心跳汇报：阶段转换、失败、开发完成、测试完成、收口完成等关键节点都要汇报
- 如果某阶段已经结束却尚未自动进入下一阶段，编排者必须立刻补转，不能停住
- 进度汇报不能替代流程推进；汇报时需明确区分 P1/P2 完成、P3 完成、功能闭环完成

### 中大型任务
planner → builder → reviewer-codex → reviewer-gemini → reviewer-minimax → tester → planner（收口）

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
- `执行计划.md` 的初稿作者只能是 `planner-codex`
- `builder-codex` 只能更新 P3 实施记录，不得代写 P2
- 若开发中发现计划失效或范围变化，必须退回 `planner-codex` 重写或修订 Plan

## 8. 模板位置

- `.agent/templates/方案设计模板.md`
- `.agent/templates/执行计划模板.md`
- `.agent/templates/审查报告模板.md`
- `.agent/templates/测试计划模板.md`

## 9. 任务文档位置

`.agent/tasks/`
