# journald.conf 补丁说明

## 目的

为 systemd-journald 设置日志大小上限和保留时间，防止 journal 日志无限增长撑满磁盘。

## 适用场景

服务器已开启 journald 持久化存储（`/var/log/journal/` 目录存在）。
如果该目录不存在（tmpfs 模式），journal 重启后丢失，配置意义有限。

## 前置检查

```bash
# 检查 journald 存储模式
ls /var/log/journal/ 2>/dev/null && echo "persistent mode" || echo "tmpfs mode (no persistent storage)"

# 查看当前日志占用
journalctl --disk-usage
```

## 操作步骤

### 1. 编辑 journald 配置

```bash
sudo nano /etc/systemd/journald.conf
```

在 `[Journal]` 小节下添加或修改以下配置：

```ini
[Journal]
SystemMaxUse=500M
SystemMaxFileSize=50M
MaxRetentionSec=14day
```

配置项说明：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `SystemMaxUse` | `500M` | journal 日志最大占用 500MB |
| `SystemMaxFileSize` | `50M` | 单个 journal 文件最大 50MB |
| `MaxRetentionSec` | `14day` | 日志保留最长时间 14 天 |

### 2. 如果 `/var/log/journal/` 不存在（可选）

```bash
# 创建持久化目录
sudo mkdir -p /var/log/journal/$(cat /etc/machine-id)

# 设置权限
sudo systemd-tmpfiles --create --prefix /var/log/journal

# 重启 journald 生效
sudo systemctl restart systemd-journald
```

### 3. 验证

```bash
# 先尝试重载；若涉及部分容量/保留参数在当前 systemd 版本下未生效，再改用 restart
sudo systemctl kill -s SIGHUP systemd-journald

# 确认当前模式与占用
journalctl --disk-usage
ls /var/log/journal/ 2>/dev/null && echo "persistent mode" || echo "tmpfs mode"
```

说明：
- `SIGHUP` 适合做轻量重载，用于先确认配置文件可被重新读取。
- 对某些 systemd 版本，`SystemMaxFileSize`、`MaxRetentionSec` 这类容量/保留相关参数未必会在 `SIGHUP` 后按预期生效；若本次修改涉及这些项，保守做法应优先使用 `sudo systemctl restart systemd-journald`。
- 即时验收仍只确认“已 reload/restart、模式可识别、占用可读取”，不把一次重载后的占用输出误当成策略已实际触发。

## 部署后验收与恢复

### 通过标准
- `journalctl --disk-usage` 可正常返回当前占用。
- 若处于持久化模式，可确认 `/var/log/journal/` 目录存在且可读。
- 已记录当前模式是 persistent 还是 tmpfs，并能解释该模式对保留策略的影响。
- 已明确本轮即时验收只能确认“配置已 reload/restart、当前模式已识别、占用可读取”，不能仅凭一次 `journalctl --disk-usage` 就断言 `SystemMaxFileSize=50M` 或 `MaxRetentionSec=14day` 已被实际触发。

### 常见失败表现
- `journalctl --disk-usage` 无法返回结果。
- `/var/log/journal/` 不存在，但误以为持久化策略已经生效。
- 修改 `journald.conf` 后未 reload 或 restart，导致新限制未生效。

### 恢复动作

```bash
# 先备份当前配置
sudo cp /etc/systemd/journald.conf /etc/systemd/journald.conf.bak.$(date +%Y%m%d%H%M%S)

# 先确认当前模式
ls /var/log/journal/ 2>/dev/null && echo "persistent mode" || echo "tmpfs mode"

# 重新加载或重启 journald
sudo systemctl kill -s SIGHUP systemd-journald
sudo systemctl restart systemd-journald

# 再次检查占用
journalctl --disk-usage
```

恢复原则：
- 先备份线上当前配置，再做覆盖或回退，避免丢失现场。
- 先确认模式，再判断配置是否真正生效。
- 若本次修改涉及 `SystemMaxFileSize`、`MaxRetentionSec` 等容量/保留参数，优先使用 `sudo systemctl restart systemd-journald` 作为保守口径，不只停留在 `SIGHUP`。
- 若修改后 journald 行为异常，优先恢复上一个已知可用配置，再重启 `systemd-journald`。
- tmpfs 模式下不要把“日志未持久化”误判为配置失败；这是部署形态差异，不是故障本身。
- 若执行了 journald reload/restart、目录修复或配置回退，完成后必须回到 `deploy/DEPLOY_RUNBOOK.md`，从 Step 1 重新跑一次完整闭环。

## 注意事项

- 修改 `/etc/systemd/journald.conf` 需要 sudo 权限。
- `SystemMaxUse` 设置过小可能导致重要日志被提前清理。
- tmpfs 模式下日志重启后会丢失，适合内存充裕、日志仅做短期排查的场景。
- 此配置与 `logrotate` 互补：logrotate 负责部署文件与 Nginx 日志轮转，journald.conf 限制 journal 总量与单文件大小。
