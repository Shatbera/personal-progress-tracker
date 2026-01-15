import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/quests'];
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Check if trying to access protected route without auth
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to quests if already logged in and trying to access auth pages
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/quests', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/quests/:path*', '/login', '/signup'],
};
