import { NextResponse } from 'next/server';

export function middleware(request) {
  const token =
    request.cookies.get('__Host-lk_session')?.value ||
    request.cookies.get('lk_session')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/checkout/:path*', '/checkout'],
};
