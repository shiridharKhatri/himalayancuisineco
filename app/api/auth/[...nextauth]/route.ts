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
      // Mock credentials validation mapping to our database seeded user
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

