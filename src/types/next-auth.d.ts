import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    companyId: string;
    companyName: string;
    companySlug: string;
    avatar: string | null;
    isSuperAdmin?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      companyId: string;
      companyName: string;
      companySlug: string;
      avatar: string | null;
      isSuperAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    companyId: string;
    companyName: string;
    companySlug: string;
    avatar: string | null;
    isSuperAdmin?: boolean;
  }
}
