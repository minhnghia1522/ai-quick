import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/translate/languages', request.url));
  }
  return NextResponse.next();
}

// Chỉ áp dụng middleware cho "/"
export const config = {
  matcher: ['/']
};
