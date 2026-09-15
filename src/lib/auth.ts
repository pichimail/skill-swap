import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { normalizeGoogleSessionUser } from '@/lib/auth-session';

export function isGoogleOAuthConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      (process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET),
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'missing-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing-google-client-secret',
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === 'google' && account.providerAccountId) {
        token.googleSub = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;

      const user = normalizeGoogleSessionUser({
        googleSub: typeof token.googleSub === 'string' ? token.googleSub : null,
        email: session.user.email,
        name: session.user.name,
      });

      session.user.id = user.uid;
      return session;
    },
  },
};
