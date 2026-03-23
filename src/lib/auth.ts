/* eslint-disable @typescript-eslint/no-explicit-any */
import GitHubProvider from "next-auth/providers/github";

export const authOptions: any = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      // 首次登录时，user.id 即 GitHub 用户 ID
      if (user?.id) {
        token.sub = user.id as string;
      }

      // 白名单判断（仅在环境变量已配置时生效）
      const allowed = process.env.ALLOWED_GITHUB_USERS;
      if (allowed !== undefined && allowed !== "") {
        const allowedIds = allowed.split(",").map((id: string) => id.trim());
        token.whitelisted = allowedIds.includes(token.sub as string);
      } else {
        // 未配置白名单时，默认允许（开发容错）
        token.whitelisted = true;
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub as string;
        // 传递白名单状态
        (session.user as any).whitelisted = token.whitelisted;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
