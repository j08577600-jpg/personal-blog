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

### 2. 如果 /var/log/journal/ 不存在（可选）

```bash
# 创建持久化目录
sudo mkdir -p /var/log/journal/$(ls /etc/machine-id)

# 设置权限
sudo systemd-tmpfiles --create --prefix /var/log/journal

# 重启 journald 生效
sudo systemctl restart systemd-journald
```

### 3. 验证

```bash
# 重载配置
sudo systemctl kill -s SIGHUP systemd-journald

# 确认配置生效
journalctl --disk-usage
```

## 注意事项

- 修改 `/etc/systemd/journald.conf` 需要 sudo 权限
- `SystemMaxUse` 设置过小可能导致重要日志被提前清理
- tmpfs 模式下日志重启后会丢失，适合内存充裕、日志仅做短期排查的场景
- 此配置与 `logrotate` 互补：logrotate 处理文件轮转，journald.conf 限制整体大小
