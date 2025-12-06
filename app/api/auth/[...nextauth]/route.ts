import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simple Environment Variable check for the "Only Me" requirement
        const adminUser = process.env.ADMIN_USER || "admin";
        const adminPass = process.env.ADMIN_PASSWORD || "admin";

        if (
          credentials?.username === adminUser &&
          credentials?.password === adminPass
        ) {
          return { id: "1", name: "Admin", email: "admin@jagadeeswar.com" };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login', // We'll handle the routing in middleware or redirect
  },
  callbacks: {
      async session({ session, token }: any) {
          if (session?.user) {
              session.user.id = token.sub;
          }
          return session;
      }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
