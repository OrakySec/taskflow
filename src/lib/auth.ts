import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma) as never,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findFirst({
          where: { email, isActive: true },
          include: { company: true },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // SUPER_ADMIN não pertence a nenhuma empresa
        const isSuperAdmin = user.role === "SUPER_ADMIN";

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId ?? null,
          companyName: isSuperAdmin ? "Sistema" : user.company?.name ?? "",
          companySlug: isSuperAdmin ? "system" : user.company?.slug ?? "",
          avatar: user.avatar,
          isSuperAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as never as { role: string }).role;
        token.companyId = (user as never as { companyId: string | null }).companyId;
        token.companyName = (user as never as { companyName: string }).companyName;
        token.companySlug = (user as never as { companySlug: string }).companySlug;
        token.avatar = (user as never as { avatar: string | null }).avatar;
        token.isSuperAdmin = (user as never as { isSuperAdmin?: boolean }).isSuperAdmin ?? false;
      }
      if (trigger === "update" && session) {
        if (session.avatar !== undefined) token.avatar = session.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.companyId = (token.companyId as string | null) ?? "";
      session.user.companyName = token.companyName as string;
      session.user.companySlug = token.companySlug as string;
      session.user.avatar = token.avatar as string | null;
      session.user.isSuperAdmin = (token.isSuperAdmin as boolean) ?? false;
      return session;
    },
  },
});
