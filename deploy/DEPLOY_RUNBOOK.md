# personal-blog 部署与运行说明

## 运行方式

生产环境使用 `systemd` 托管 Next.js 进程，监听 `127.0.0.1:8080`，由 Nginx 反向代理到 `https://blog.chenjilan.com`。

链路：

- 浏览器 -> Nginx :443
- Nginx -> `127.0.0.1:8080`
- `systemd` -> `npm run start`

## systemd 服务文件

文件：`deploy/personal-blog.service`

安装：

```bash
sudo cp /home/cjl/projects/personal-blog/deploy/personal-blog.service /etc/systemd/system/personal-blog.service
sudo systemctl daemon-reload
sudo systemctl enable --now personal-blog
```

查看状态：

```bash
systemctl status personal-blog --no-pager -l
journalctl -u personal-blog -n 100 --no-pager
```

重启：

```bash
sudo systemctl restart personal-blog
```

停止：

```bash
sudo systemctl stop personal-blog
```

## 发布流程

先做发布前检查：

```bash
cd /home/cjl/projects/personal-blog
bash scripts/release-check.sh
```

然后重启服务：

```bash
sudo systemctl restart personal-blog
```

重启完成后，不要结束在这里；立即进入下方“部署后收口检查”的 Step 0，并按 Step 1 到 Step 6 顺序完成一次完整闭环。

## 部署后收口检查

说明：
- 本节只定义部署后检查闭环，不代表这些命令已在线上执行。
- 执行顺序固定为：上游健康 -> 公网健康 -> 服务状态 -> 应用日志 -> 日志轮转 -> 磁盘占用。
- 任何一步失败都先停止后续检查，先恢复到上一个稳定状态，再从失败步骤重试。
- 建议为每一步记录命令返回码、关键输出和处理结论，作为收口证据。

### Step 0: 前置条件

开始前先确认：
- 当前发布已完成，代码和配置已同步到服务器。
- `personal-blog` 服务刚完成重启，或确认当前实例就是待验收版本。
- 如需验证 logrotate 或 journald，具备 sudo 权限。

若前置条件不满足：
- 不进入后续验收，先完成发布或权限准备。

### Step 1: 上游健康检查

```bash
curl -fsS http://127.0.0.1:8080/api/health
```

通过标准：
- HTTP 200。
- 返回 JSON。
- 响应体包含 `"ok":true`。

失败表现：
- `curl` 非 0 退出。
- 返回 5xx、超时、连接拒绝。
- 返回内容不是 JSON 或缺少 `ok: true`。

恢复动作：
```bash
systemctl --no-pager --full status personal-blog
journalctl -u personal-blog -n 100 --no-pager
sudo systemctl restart personal-blog
```

恢复原则：
- 先确认 `personal-blog` 是否已退出、启动失败或进入重启循环。
- 重启后先重复本步骤，不要直接跳到公网检查。

### Step 2: 公网健康检查

```bash
curl -kfsS https://blog.chenjilan.com/api/health
```

通过标准：
- HTTP 200。
- 返回 JSON。
- 响应体包含 `"ok":true`。

失败表现：
- 上游成功，但域名请求失败、超时、返回 502/503。
- 返回了 Nginx 错页而不是健康 JSON。

恢复动作：
```bash
systemctl status nginx --no-pager -l
sudo tail -n 100 /var/log/nginx/error.log
curl -fsS http://127.0.0.1:8080/api/health
```

恢复原则：
- 若上游仍成功，优先排查 Nginx 反代、证书或防火墙路径。
- 若排查后发现上游也已失败，回到 Step 1 重新恢复。

### Step 3: 服务状态检查

```bash
systemctl --no-pager --full status personal-blog
```

通过标准：
- 状态为 `active (running)`。
- 无连续重启、退出码异常、端口占用等明显错误。

失败表现：
- `inactive`、`failed`、`activating` 卡住。
- `status` 输出里出现 restart counter 持续增长。

恢复动作：
```bash
journalctl -u personal-blog -n 200 --no-pager
sudo systemctl restart personal-blog
systemctl --no-pager --full status personal-blog
```

恢复原则：
- 先从 `journalctl` 定位启动失败原因，再决定是否回滚代码或配置。
- 未恢复 `active (running)` 前，不继续后续日志与轮转验收。

### Step 4: 应用日志检查

```bash
journalctl -u personal-blog -n 200 --no-pager
```

通过标准：
- 最近 200 行中没有新的启动失败、端口冲突、权限错误、依赖缺失。
- 没有连续 crash loop 或重复重启痕迹。

失败表现：
- 出现 stack trace、监听端口失败、权限拒绝。
- 短时间内重复出现 `Started` / `Exited`。

恢复动作：
```bash
sudo systemctl restart personal-blog
journalctl -u personal-blog -n 100 --no-pager
```

恢复原则：
- 若错误来自当前发布内容，先回退到上一个已知可用版本，再重新执行 Step 1。
- 若只是短暂噪音但服务已稳定，需要记录原因，不可直接忽略。

### Step 5: 日志轮转检查

```bash
sudo logrotate --debug /etc/logrotate.d/personal-blog
```

通过标准：
- 命令退出成功。
- 输出中无语法错误、无配置解析失败、无路径级致命错误。

失败表现：
- 输出包含 `error:`。
- 配置文件无法解析，或 block 路径、postrotate 命令异常。

恢复动作：
```bash
sudo cp /etc/logrotate.d/personal-blog /etc/logrotate.d/personal-blog.bak.$(date +%Y%m%d%H%M%S)
sudo cp /home/cjl/projects/personal-blog/deploy/logrotate.conf /etc/logrotate.d/personal-blog
sudo logrotate --debug /etc/logrotate.d/personal-blog
```

恢复原则：
- 先备份线上当前文件，再用仓库内当前已知版本覆盖，避免丢失现场。
- `logrotate --debug` 只验证配置可解析，不代表一定已看到真实轮转结果；真实轮转行为仍需后续按运维窗口观察。
- 若恢复成功，必须从 Step 1 重新执行完整闭环，不要只从 Step 5 继续签收。
- 若仍失败，停止继续验收，单独处理日志配置问题。

### Step 6: journald 占用检查

```bash
journalctl --disk-usage
du -sh /var/log/journal 2>/dev/null || echo "journal tmpfs mode"
```

通过标准：
- 能获得当前 journal 占用结果。
- 占用结果可被人工记录，并与 `SystemMaxUse=500M` 预期上限对照。
- 若显示 `journal tmpfs mode`，说明当前不是持久化目录模式，需单独记录。

失败表现：
- 命令报错或无法判断当前存储模式。
- 占用明显异常增长，但没有对应处理记录。

恢复动作：
```bash
ls /var/log/journal/ 2>/dev/null && echo "persistent mode" || echo "tmpfs mode"
journalctl --disk-usage
```

恢复原则：
- 先确认是持久化模式还是 tmpfs 模式，再决定是否继续调整 journald 配置。
- 若涉及编辑或覆盖 `/etc/systemd/journald.conf`，同样必须先备份当前文件：`sudo cp /etc/systemd/journald.conf /etc/systemd/journald.conf.bak.$(date +%Y%m%d%H%M%S)`，与 Step 5 的 logrotate 恢复要求保持一致。
- `journalctl --disk-usage` 只能作为占用与模式确认，不足以单独证明 `SystemMaxFileSize` 或 `MaxRetentionSec` 已在当前时刻触发；若需更强证明，必须结合后续日志文件滚动或保留周期观察。
- 若超过预期阈值，先清晰记录现状与模式，再按 `deploy/journald.conf补丁说明.md` 处理。
- 若因 journald 配置调整而执行了 reload/restart 或目录修复，完成后同样从 Step 1 重新跑完整闭环。

## 收口判定

以下条件同时满足，才可视为本轮部署后收口完成：
- Step 1 到 Step 6 均按顺序执行。
- 每一步都有通过结论或失败恢复记录。
- `/api/health` 上游与公网路径都返回 `ok: true`。
- `personal-blog` 服务为 `active (running)`，且最近日志无新错误。
- `logrotate --debug` 无语法错误。
- journald 占用已记录，并能说明当前模式与是否在阈值内。

## 故障排查

### 现象：网页返回 502

先检查应用是否还活着：

```bash
curl -I http://127.0.0.1:8080
systemctl status personal-blog --no-pager -l
journalctl -u personal-blog -n 100 --no-pager
```

### 如果 8080 不通

说明不是 Nginx 本身坏了，而是上游 Next.js 进程没在跑或启动失败。

### 检查 Nginx

```bash
systemctl status nginx --no-pager -l
sudo tail -n 100 /var/log/nginx/error.log
```

## 监控与日志

### 健康检查

```bash
# 上游健康
curl -fsS http://127.0.0.1:8080/api/health

# 线上健康
curl -kfsS https://blog.chenjilan.com/api/health
```

健康端点返回 `{ "ok": true, "timestamp": "...", "version": "0.1.0" }` 时视为正常。

### 日志查看

```bash
# Next.js 应用日志（最近 200 行）
journalctl -u personal-blog -n 200 --no-pager

# 实时跟踪
journalctl -u personal-blog -f --no-pager

# Nginx 错误日志
sudo tail -n 100 /var/log/nginx/error.log

# 日志磁盘占用
journalctl --disk-usage
du -sh /var/log/journal 2>/dev/null || echo "journal tmpfs mode"
```

### 日志轮转验证

```bash
# 手动触发 logrotate dry-run
sudo logrotate --debug /etc/logrotate.d/personal-blog

# 检查 logrotate cron 是否存在
ls /etc/cron.daily/logrotate 2>/dev/null && echo "OK" || echo "NOT FOUND"
```

### 常见故障

| 现象 | 检查项 |
|------|--------|
| 健康检查 500 | `journalctl -u personal-blog -n 50 --no-pager` |
| 磁盘满 | `journalctl --disk-usage`；`du -sh /var/log/*` |
| Nginx 502 | 见「故障排查」章节 |
