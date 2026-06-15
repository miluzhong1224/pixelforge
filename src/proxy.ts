import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  const session = await auth();

  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedPaths = ['/generate', '/edit', '/dashboard', '/settings', '/crop'];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isApiRoute = pathname.startsWith('/api/generate') || pathname.startsWith('/api/images') || pathname.startsWith('/api/image');

  if ((isProtected || isApiRoute) && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/generate', '/edit/:path*', '/dashboard', '/settings', '/crop/:path*', '/api/generate/:path*', '/api/images/:path*', '/api/image/:path*'],
};
