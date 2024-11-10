import { NextResponse, NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log(`Middleware invoked for path: ${pathname}`);

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('admin_token')?.value;

    if (!token) {
      console.log('No admin_token found, redirecting to /admin/login');
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jose.jwtVerify(token, secret);
      console.log('JWT verified successfully');
      return NextResponse.next();
    } catch (error) {
      console.error('JWT verification failed:', error);
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
