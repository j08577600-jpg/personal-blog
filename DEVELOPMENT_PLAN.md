# 开发计划

## 阶段 1：MVP 基础版 ✅
- 搭建极简中文技术博客界面
- 接入 GitHub 登录
- 内容先使用本地静态数据
- 跑通部署与 HTTPS 基础链路

## 阶段 2：内容发布流程 ✅
- 将文章迁移到 MDX
- 增加作者专用草稿流
- 增加文章元信息、封面图与标签
- 增加更完整的 SEO 与社交分享卡片

## 阶段 3：内容运营能力 🔄（文件驱动版完成，在线编辑待 V2）
- 简单后台控制台 ✅（`/dashboard`，Zod frontmatter 验证，三态分类：已发布/草稿/待修复）
- 草稿 / 已发布状态管理 ✅（`published` 字段 + Dashboard 可视化）
- 编辑与发布流程 ✅（文件驱动，详见 `docs/文章发布流程.md`）
- 可选接入 Git 仓库或数据库作为内容存储 📋（V2 方向）

## 阶段 4：生产化完善 🔄
- 在 80/443 上接入反向代理 ✅（`deploy/nginx.blog.chenjilan.com.conf`）
- 接入长期运行的进程管理或 systemd ✅（`deploy/personal-blog.service`）
- 使用正式 TLS 证书 ✅（由 Nginx 配置引用 `certs/` 目录）
- 加入监控与日志轮转 🔄（`scripts/release-check.sh` 提供基础健康检查）

## 阶段 5：博客扩展 ✅（部分）
- 搜索
- RSS / sitemap ✅（`feature/sitemap-rss` → `main`，commit `10dd479`）
- 项目页
- 阅读清单 / 碎片笔记
- 数据分析
