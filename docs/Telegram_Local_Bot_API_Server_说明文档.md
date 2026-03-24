# Telegram Local Bot API Server — 部署说明文档

> 本文档说明 blog 项目中 Telegram Local Bot API Server 的部署架构、当前状态、以及 OpenClaw 集成的pending patch 情况。

---

## 1. 什么是 Telegram Local Bot API Server

Telegram Bot API 是 Telegram 官方的 HTTP API，Telegram Bot API Server 是官方提供的自托管实现。

在 `--local` 模式下，Local Server 提供普通 Bot API 没有的能力：

| 能力 | 标准 Bot API | Local Server（--local）|
|------|-------------|----------------------|
| 下载文件大小限制 | 20 MB | **无限制** |
| 上传文件大小 | 50 MB | **2000 MB** |
| 上传文件方式 | multipart/form-data | **可直接传本地文件路径（file:// URI）** |
| getFile 返回值 | 远程 URL | **本地绝对路径** |
| Webhook 端口 | 固定 | **任意端口** |

blog 项目需要 Local Server 的核心原因：
- 发送大文件（视频）时，标准 API 的 50 MB 上限和 multipart 上传方式不够用
- 需要用 `file://` 本地路径直接上传，避免先读入内存再上传

---

## 2. 部署状态

### 服务信息

| 项目 | 值 |
|------|-----|
| 二进制文件 | `/usr/local/bin/telegram-bot-api` |
| 源码目录 | `/home/cjl/telegram-bot-api/` |
| systemd service | `telegram-bot-api.service`（开机自启） |
| 运行端口 | `8081` |
| 运行模式 | `--local`（无文件大小限制）|
| Bot API 版本 | **9.5** |
| api_id | `37185580` |

### 编译安装过程

```bash
# 克隆源码
git clone --recursive https://github.com/tdlib/telegram-bot-api.git
cd telegram-bot-api
mkdir build && cd build

# 编译
cmake -DCMAKE_BUILD_TYPE=Release ..
cmake --build . --target install

# 运行（--local 模式，无文件大小限制）
/usr/local/bin/telegram-bot-api --api-id=37185580 \
  --api-hash=<your_api_hash> \
  --local \
  --http-port=8081 \
  --dir /var/lib/telegram-bot-api
```

### systemd service 配置

服务通过 systemd 管理，开机自动启动。

---

## 3. 当前使用方式（curl 脚本方案）

### 工作原理

OpenClaw 的 Telegram 频道目前使用标准 HTTPS 方式连接 Telegram Bot API。

对于大文件发送（如视频），则通过 `~/.openclaw/scripts/tg-send-video.sh` 这个 curl 脚本绕道 Local Server 上传：

```bash
#!/bin/bash
# 用法: tg-send-video.sh <chat_id> <file_path> [caption]
CHAT_ID="$1"
FILE="$2"
CAPTION="${3:-}"
TOKEN="<bot_token>"
API="http://localhost:8081"

curl -s -X POST "$API/bot$TOKEN/sendVideo" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\": \$CHAT_ID, \"video\": \"file://\$FILE\", \"caption\": \"\$CAPTION\"}"
```

核心区别：
- OpenClaw 普通消息 → 标准 Telegram Bot API（HTTPS，官方）
- 大文件发送（视频等）→ Local Server（HTTP，localhost:8081）

### 脚本位置

- `~/.openclaw/scripts/tg-send-video.sh`

---

## 4. OpenClaw 原生集成方案（Pending PR）

### 原始方案：grammY patch

最初尝试通过 patch `node_modules/grammY/dist/` 文件让 grammY 内部 HTTP 客户端改用 Local Server。

**结论：不可行，已回滚。**
- grammY patch 涉及 11 个文件
- 每次 grammY 更新都会失效
- 方案过于脆弱，已全部回滚（2026-03-14）

### 当前 Pending 方案：feat/telegram-api-root PR

OpenClaw 源码侧有一个待提交的 PR：

- **PR 名称**：`feat/telegram-api-root`
- **功能**：在 OpenClaw 的 Telegram channel 配置中增加 `channels.telegram.apiRoot` 选项
- **效果**：OpenClaw 原生支持指定 Bot API 根地址（标准官方地址或本地 Local Server）

```yaml
channels:
  telegram:
    token: "<bot_token>"
    apiRoot: "http://localhost:8081"   # 新增：指向 Local Server
```

**当前状态**：方案已确定，PR 待提交（搁置中）

### 后续路线

1. **短期**：继续用 curl 脚本方案（已工作）
2. **长期**：合并 `feat/telegram-api-root` PR，OpenClaw 原生支持本地 API 根地址，curl 脚本可以退役

---

## 5. 已知限制

| 限制 | 说明 | 处理方式 |
|------|------|---------|
| Bot Token 明文写在脚本里 | `tg-send-video.sh` 里 hardcoded 了 token | 考虑改用环境变量 |
| OpenClaw 主频道仍走官方 API | 普通消息不发 Local Server | 等 PR 合并后原生支持 |
| Local Server 不处理 Telegram 文件下载 | 只处理上传，下载走官方 API | 当前架构已满足 |
| 切换 bot 到 Local Server 需先 logOut | Telegram 账号不能同时在多处登录 | Telegram 官方限制 |

---

## 6. 健康检查

```bash
# 检查服务状态
systemctl status telegram-bot-api.service

# 检查端口
curl -s http://localhost:8081/getMe

# 查看最近的 git commit（tdlib 版本）
cd /home/cjl/telegram-bot-api && git log --oneline -3
```

---

## 7. 升级流程

当 Telegram 发布新 Bot API 版本时：

```bash
cd /home/cjl/telegram-bot-api
git pull
git submodule update --recursive
mkdir -p build && cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
cmake --build . --target install

# 重启服务
sudo systemctl restart telegram-bot-api.service
```

---

## 8. 相关文件索引

| 文件 | 用途 |
|------|------|
| `/usr/local/bin/telegram-bot-api` | 编译好的二进制 |
| `/home/cjl/telegram-bot-api/` | 源码 |
| `~/.openclaw/scripts/tg-send-video.sh` | 大文件上传 curl 脚本 |
| `/etc/systemd/system/telegram-bot-api.service` | systemd service 配置 |
| `~/.openclaw/workspace-translator/MEMORY.md` | Dyna 的记忆文件 |

---

## 9. 相关 OpenClaw Issue

- **PR**：`openclaw/openclaw#45720`（feat: Local Bot API Server）
- **合并后通知 jay**
