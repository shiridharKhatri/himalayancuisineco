import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Setup next-auth handler configuration
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Mock credentials validation mapping to our database seeded users
        if (
          credentials?.email === "admin@himalayan.com" &&
          credentials?.password === "adminpassword"
        ) {
          return {
            id: "u-admin",
            name: "Tashi Sherpa (Admin)",
            email: "admin@himalayan.com",
            role: "ADMIN",
          };
        }
        
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

        return null;
      }
    })
  ],
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
});

export { handler as GET, handler as POST };
