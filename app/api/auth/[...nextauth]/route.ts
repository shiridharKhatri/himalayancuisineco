import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Setup next-auth handler configuration
const providers: any[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email) return null;
      const email = credentials.email.toLowerCase().trim();
      const password = credentials.password || "";

      // 1. Check SQLite database for dynamic admins, managers, and staff
      try {
        const { prisma } = await import("@/lib/prisma");
        const dbUser = await prisma.user.findUnique({
          where: { email },
        });

        if (dbUser && dbUser.password === password) {
          return {
            id: dbUser.id,
            name: dbUser.name || "Himalayan Staff",
            email: dbUser.email,
            role: dbUser.role || "STAFF",
          };
        }
      } catch (e) {
        console.error("DB Auth check fallback:", e);
      }

      // 2. Primary fallback admin credentials validation
      if (
        (email === "admin@himalayan.com" && password === "adminpassword") ||
        (email === "admin@himalayancuisineco.com" && password === "admin123") ||
        (email === "admin@himalayancuisineco.com" && password === "adminpassword")
      ) {
        return {
          id: "u-admin",
          name: "Tashi Sherpa (Admin)",
          email: credentials.email,
          role: "ADMIN",
        };
      }

      // Customer credentials validation
      if (
        credentials?.email === "customer@himalayan.com" &&
        credentials?.password === "customerpassword"
      ) {
        return {
          id: "u-customer",
          name: "Mingma Lama",
          email: "customer@himalayan.com",
          role: "CUSTOMER",
        };
      }

      // Phone OTP verified users (email pattern: phone-XXXXXXXXXX@himalayan.com)
      if (
        credentials?.email?.startsWith("phone-") &&
        credentials?.password === "phone-otp-verified"
      ) {
        const phoneDigits = credentials.email.replace("phone-", "").replace("@himalayan.com", "");
        return {
          id: `u-phone-${phoneDigits}`,
          name: `Phone User (${phoneDigits.slice(-4)})`,
          email: credentials.email,
          role: "CUSTOMER",
        };
      }

      return null;
    }
  }),
];

// Only add Google provider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: AuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "himalayan-cuisine-super-secret-key-9988",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

