/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import AzureADProvider from "next-auth/providers/azure-ad";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { redirect } from "next/navigation";

const AUTHOR_LOGIN_PROVIDERS = [
  {
    id: "github",
    label: "GitHub",
    isEnabled: Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
  },
  {
    id: "google",
    label: "Google",
    isEnabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  },
  {
    id: "azure-ad",
    label: "Microsoft",
    isEnabled: Boolean(
      process.env.MICROSOFT_CLIENT_ID &&
        process.env.MICROSOFT_CLIENT_SECRET &&
        process.env.MICROSOFT_TENANT_ID,
    ),
  },
] as const;

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() || null;
}

function parseAllowedAuthorEmails() {
  const raw = process.env.ALLOWED_AUTHOR_EMAILS;

  if (!raw) {
    return null;
  }

  const emails = raw
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter((email): email is string => Boolean(email));

  return emails.length > 0 ? new Set(emails) : null;
}

function getEnabledProviders() {
  return AUTHOR_LOGIN_PROVIDERS.filter((provider) => provider.isEnabled);
}

const allowedAuthorEmails = parseAllowedAuthorEmails();

export const authorLoginProviders = AUTHOR_LOGIN_PROVIDERS;

export const authOptions: any = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      tenantId: process.env.MICROSOFT_TENANT_ID || "",
    }),
  ].filter((provider) => {
    const config = AUTHOR_LOGIN_PROVIDERS.find((item) => item.id === provider.id);
    return config?.isEnabled ?? false;
  }),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }: any) {
      if (user?.id) {
        token.sub = user.id as string;
      }

      if (account?.provider) {
        token.provider = account.provider;
      }

      if (account?.providerAccountId) {
        token.providerAccountId = account.providerAccountId;
      }

      const email = normalizeEmail(user?.email ?? token.email ?? profile?.email ?? profile?.preferred_username);
      token.email = email;
      token.whitelisted = allowedAuthorEmails ? allowedAuthorEmails.has(email ?? "") : true;

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub as string | undefined;
        session.user.email = (token.email as string | null | undefined) ?? null;
        session.user.whitelisted = Boolean(token.whitelisted);
        session.user.provider = (token.provider as string | undefined) ?? undefined;
        session.user.providerAccountId = (token.providerAccountId as string | undefined) ?? undefined;
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
    image?: string | null;
    whitelisted?: boolean;
    provider?: string;
    providerAccountId?: string;
  };
};

export async function getAuthorSession() {
  return (await getServerSession(authOptions)) as AuthorSession | null;
}

export function getAuthorLoginState() {
  return {
    providers: getEnabledProviders(),
    whitelistEnabled: Boolean(allowedAuthorEmails),
  };
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
