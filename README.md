# personal-blog

一个极简的中文技术个人博客项目，基于 Next.js、TypeScript、Tailwind CSS 与 GitHub OAuth（NextAuth）构建。

## 技术栈
- Next.js
- TypeScript
- Tailwind CSS
- NextAuth（GitHub 登录）

## 第一版功能
- 极简首页
- 关于页
- 博客列表页
- 基于本地数据的文章详情页
- GitHub 登录页
- 受保护的控制台种子页
- 本地 HTTPS 开发辅助脚本
- 域名反代配置模板

## 初始化

```bash
npm install
cp .env.example .env.local
```

需要填写：
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GITHUB_ID`
- `GITHUB_SECRET`

## GitHub OAuth 配置
正式域名使用：
- Homepage URL: `https://blog.chenjilan.com`
- Callback URL: `https://blog.chenjilan.com/api/auth/callback/github`

临时本地 HTTP 开发可用：
- Homepage URL: `http://localhost:8080`
- Callback URL: `http://localhost:8080/api/auth/callback/github`

## 本地开发

HTTP：
```bash
PORT=8080 npm run dev
```

HTTPS 辅助：
```bash
chmod +x scripts/generate-dev-cert.sh
./scripts/generate-dev-cert.sh
node server/dev-https-server.mjs
```

## 反向代理配置
项目已附带正式域名的 nginx 配置模板：

```bash
deploy/nginx.blog.chenjilan.com.conf
```

## 关于 80/443
直接绑定 80/443 一般需要系统权限，推荐使用 nginx 或 Caddy 做反向代理，再把请求转发到应用监听端口（如 8080）。

## 下一步建议
- 把文章内容迁移到 MDX
- 增加作者专用能力
- 增加草稿 / 发布流
- 接入 nginx / systemd 部署
- 完善正式 HTTPS 与生产配置
