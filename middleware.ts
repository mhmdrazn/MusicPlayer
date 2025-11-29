import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - api/health (health check)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api/auth|api/health|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Jika tidak ada token, user belum login
  // Biarkan request lanjut, layout akan handle auth check
  if (!token) {
    return NextResponse.next();
  }

  return NextResponse.next();
}
