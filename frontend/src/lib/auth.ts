import { saveUserToDB } from "@/app/actions";
import { Account } from "next-auth";
import { JWT } from "next-auth/jwt";
import Github from "next-auth/providers/github";

export const authOptions = {
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
  callbacks: {
    /* eslint-disable */
    async signIn({ user }: { user: any }) {
      const { error, userId } = await saveUserToDB(user);

      if (error) return false;

      user.savedId = userId;
      return true;
    },
    async jwt({
      token,
      user,
      account,
      profile,
    }: {
      token: JWT;
      user: any;
      account?: Account | null;
      profile?: any;
    }) {
      if (user) {
        token.savedId = user.savedId;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.username = profile.login;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      session.user.id = token.sub;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
};
