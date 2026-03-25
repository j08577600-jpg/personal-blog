import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      email?: string | null;
      image?: string | null;
      whitelisted?: boolean;
      provider?: string;
      providerAccountId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    whitelisted?: boolean;
    provider?: string;
    providerAccountId?: string;
  }
}
