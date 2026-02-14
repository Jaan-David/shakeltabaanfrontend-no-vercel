import { Api } from './endpoints';

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, '');

export const getApiBaseUrl = (): string => {
  // Client-side: use relative proxy path
  if (typeof window !== 'undefined') {
    return '/api/proxy';
  }

  // Server-side: construct absolute URL to proxy for ISR/SSR
  // This ensures server-side fetches also go through the proxy
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const host = process.env.VERCEL_URL 
    || process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '')
    || 'localhost:3000';
  
  return `${protocol}://${host}/api/proxy`;
};
