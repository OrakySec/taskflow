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

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company.name,
          companySlug: user.company.slug,
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as never as { role: string }).role;
        token.companyId = (user as never as { companyId: string }).companyId;
        token.companyName = (user as never as { companyName: string }).companyName;
        token.companySlug = (user as never as { companySlug: string }).companySlug;
        token.avatar = (user as never as { avatar: string | null }).avatar;
      }
      if (trigger === "update" && session) {
        if (session.avatar !== undefined) token.avatar = session.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.companyId = token.companyId as string;
      session.user.companyName = token.companyName as string;
      session.user.companySlug = token.companySlug as string;
      session.user.avatar = token.avatar as string | null;
      return session;
    },
  },
});
