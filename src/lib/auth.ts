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

function googleProviders() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];
  return [
    GoogleProvider({
      clientId,
      clientSecret,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ];
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
  providers: googleProviders(),
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google') {
        const profileSub = profile && 'sub' in profile ? String(profile.sub || '') : '';
        token.googleSub = account.providerAccountId || profileSub || token.googleSub;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;
      const googleSub = typeof token.googleSub === 'string' ? token.googleSub : null;
      if (!googleSub) return session;
      const user = normalizeGoogleSessionUser({
        googleSub,
        email: session.user.email,
        name: session.user.name,
      });
      session.user.id = user.uid;
      return session;
    },
  },
};
