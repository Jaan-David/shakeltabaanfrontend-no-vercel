import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Api } from '@/services/api/endpoints';
import { applyRateLimit, getRequestIp } from '@/lib/server/rateLimit';

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, '');

const ALLOWED_ROOT_PATHS = new Set([
  'users',
  'auth',
  'products',
  'inquiries',
  'organizations',
  'notifications',
  'orders',
  'payment-requests',
  'reviews',
  'wish-items',
  'categories',
  'brands',
  'cart',
  'checkout',
  'payments',
  'shipping',
  'coupons',
  'search',
  'support',
  'system',
  'uploads',
  'analytics',
  'previous-work',
]);

const hasValidPathShape = (pathParts: string[]): boolean => {
  if (!Array.isArray(pathParts) || pathParts.length === 0) return false;

  const root = pathParts[0]?.trim().toLowerCase();
  if (!root || !ALLOWED_ROOT_PATHS.has(root)) return false;

  return pathParts.every((segment) => {
    if (!segment || segment.length > 200) return false;
    if (segment.includes('..') || segment.includes('\\')) return false;
    return true;
  });
};

const buildTargetUrl = (request: NextRequest, pathParts: string[]): string => {
  const baseUrl = normalizeBaseUrl(Api);
  const pathname = pathParts.join('/');
  return `${baseUrl}/${pathname}${request.nextUrl.search}`;
};

const filterHeaders = (headers: Headers): Headers => {
  const filtered = new Headers();
  headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (['host', 'connection', 'content-length', 'accept-encoding'].includes(lowerKey)) {
      return;
    }
    filtered.set(key, value);
  });
  return filtered;
};

const proxyRequest = async (request: NextRequest, pathParts: string[]) => {
  if (!hasValidPathShape(pathParts)) {
    return NextResponse.json(
      { message: 'Proxy path is not allowed' },
      { status: 403 }
    );
  }

  const ip = getRequestIp(request.headers);
  const rateLimit = await applyRateLimit(`proxy:${request.method}:${ip}`, 120, 60_000);

  if (!rateLimit.success) {
    return NextResponse.json(
      { message: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  }

  const targetUrl = buildTargetUrl(request, pathParts);
  const headers = filterHeaders(request.headers);

  const method = request.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer();
  const hasAuthHeader = Boolean(headers.get('authorization'));

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
    cache: method === 'GET' && !hasAuthHeader ? 'force-cache' : 'no-store',
    ...(method === 'GET' && !hasAuthHeader
      ? {
          next: {
            revalidate: 300,
          },
        }
      : {}),
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('content-encoding');

  if (method === 'GET' && !hasAuthHeader && !responseHeaders.get('cache-control')) {
    responseHeaders.set('Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=1800');
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path || []);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path || []);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path || []);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path || []);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path || []);
}
