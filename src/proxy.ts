import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  if (!token?.googleSub) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = '/auth/signin';
    signIn.searchParams.set('callbackUrl', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
