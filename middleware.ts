// middleware.ts - SEO Canonical Redirects
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CANONICAL_DOMAIN = 'shakeltabaanfrontend-no-vercel.vercel.app';
const PROTOCOL = 'https';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';
  
  // 1. Redirect /en and /en/ to homepage
  if (pathname === '/en' || pathname === '/en/') {
    const url = new URL('/', request.url);
    url.protocol = PROTOCOL;
    url.host = CANONICAL_DOMAIN;
    return NextResponse.redirect(url, 301);
  }
  
  // 2. Force HTTPS + www canonical domain
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const isWrongProtocol = request.nextUrl.protocol !== `${PROTOCOL}:`;
    const isWrongHost = host !== CANONICAL_DOMAIN;
    
    if (isWrongProtocol || isWrongHost) {
      const canonicalUrl = new URL(request.url);
      canonicalUrl.protocol = PROTOCOL;
      canonicalUrl.host = CANONICAL_DOMAIN;
      canonicalUrl.pathname = pathname;
      canonicalUrl.search = search;
      
      return NextResponse.redirect(canonicalUrl, 301);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (icons, images)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|woff|woff2)).*)',
  ],
};
