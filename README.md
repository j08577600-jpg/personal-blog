# personal-blog

A minimal technical personal blog built with Next.js, TypeScript, Tailwind CSS, and GitHub authentication via NextAuth.

## Stack
- Next.js
- TypeScript
- Tailwind CSS
- NextAuth (GitHub provider)

## Features in v1
- Minimal home page
- About page
- Blog list
- Dynamic blog post pages from local data
- GitHub sign-in page
- Protected dashboard seed page
- Local HTTPS dev helper with self-signed certs

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GITHUB_ID`
- `GITHUB_SECRET`

## GitHub OAuth app setup
Create a GitHub OAuth App with:
- Homepage URL: `http://localhost:3000`
- Callback URL: `http://localhost:3000/api/auth/callback/github`

For HTTPS local development, use:
- Homepage URL: `https://localhost:3443`
- Callback URL: `https://localhost:3443/api/auth/callback/github`

## Local development

HTTP:
```bash
npm run dev
```

HTTPS helper:
```bash
chmod +x scripts/generate-dev-cert.sh
./scripts/generate-dev-cert.sh
node server/dev-https-server.mjs
```

Production-style reverse proxy config is included at:
```bash
deploy/nginx.blog.chenjilan.com.conf
```

## Notes on port 80 and self-signed HTTPS
Binding directly to port 80 usually requires elevated privileges or a reverse proxy like nginx/Caddy. In environments without root access, develop on high ports first (8080 / 3443), then forward or reverse proxy later.

## Suggested next steps
- Move posts to MDX
- Add protected author tools
- Add author-only publishing flow
- Add deployment via nginx/systemd
- Add production TLS
ction TLS
