# personal-blog 部署与运行说明

## 运行方式

生产环境使用 `systemd` 托管 Next.js 进程，监听 `127.0.0.1:8080`，由 Nginx 反向代理到 `https://blog.chenjilan.com`。

链路：

- 浏览器 → Nginx :443
- Nginx → `127.0.0.1:8080`
- `systemd` → `npm run start`

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
# 上游健康（自动）
curl -fsSI --max-time 5 http://127.0.0.1:8080/api/health

# 线上健康（自动）
curl -kfsSI --max-time 5 https://blog.chenjilan.com/api/health
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
du -sh /var/log/journal/ 2>/dev/null || echo "journal tmpfs mode"
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
