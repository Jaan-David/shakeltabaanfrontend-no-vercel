import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Api } from '@/services/api/endpoints';

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, '');

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
  const targetUrl = buildTargetUrl(request, pathParts);
  const headers = filterHeaders(request.headers);

  const method = request.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer();

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('content-encoding');

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
