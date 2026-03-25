/* eslint-disable @typescript-eslint/no-explicit-any */
import GitHubProvider from "next-auth/providers/github";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

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
      if (user?.id) {
        token.sub = user.id as string;
      }

      const allowed = process.env.ALLOWED_GITHUB_USERS;
      if (allowed !== undefined && allowed !== "") {
        const allowedIds = allowed.split(",").map((id: string) => id.trim());
        token.whitelisted = allowedIds.includes(token.sub as string);
      } else {
        token.whitelisted = true;
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as any).whitelisted = token.whitelisted;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export type AuthorSession = {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    whitelisted?: boolean;
  };
};

export async function getAuthorSession() {
  return (await getServerSession(authOptions)) as AuthorSession | null;
}

export async function requireAuthorPageSession() {
  const session = await getAuthorSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.whitelisted === false) {
    redirect("/unauthorized");
  }

  return session;
}

export async function requireAuthorApiSession() {
  const session = await getAuthorSession();

  if (!session?.user) {
    return { ok: false as const, status: 401, message: "请先登录" };
  }

  if (session.user.whitelisted === false) {
    return { ok: false as const, status: 403, message: "你没有写作权限" };
  }

  return { ok: true as const, session };
}
