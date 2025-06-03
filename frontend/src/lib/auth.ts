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
    async jwt({
      token,
      account,
      profile,
    }: {
      /* eslint-disable */
      token: JWT;
      account?: Account | null;
      profile?: any;
    }) {
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
};
