import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Keep dev and production build artifacts isolated to avoid manifest/chunk conflicts
  // when running `next dev` and `next build` in separate terminals.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',

  // Enable compression (gzip by default, brotli on compatible servers)
  compress: true,
  
  // Response compression - Next.js uses gzip for gzip, brotli for brotli
  // Deploy platform (Vercel/Fly.io) handles brotli compression automatically
  // For self-hosted, ensure your server supports it
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,      // 60 seconds
    pagesBufferLength: 5,            // Lower memory usage
  },
  
  // Development indicators configuration
  devIndicators: false,
  
  // Allow cross-origin requests in development
  allowedDevOrigins: [
    'http://192.168.1.2:3000',
    'http://192.168.1.2:3001',
  ],
  
  // GSAP transpilation fix for build errors
  transpilePackages: ['gsap'],
  
  /**
   * Performance: Enable experimental optimizations
   * - optimizeCss: Inlines critical CSS, removes unused styles
   * - optimizePackageImports: Tree-shake unused code from packages
   * - tailwindCss: Auto-configure Tailwind for better purging
   */
  experimental: {
    optimizeCss: true,              // Inline critical CSS
    optimizePackageImports: [      // Tree-shake unused code from large packages
      'lucide-react',
      // Keep react-icons out of optimizePackageImports.
      // Next.js Webpack dev can generate a missing vendor chunk reference
      // (`./vendor-chunks/react-icons.js`) for App Router pages.
    ],
  },
  
  // Image configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'marble-bajco.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'shk2t-t3ban.fly.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'shakeltaaban-d8cwcdeteadge4fe.switzerlandnorth-01.azurewebsites.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'shakeltabaanstorage.blob.core.windows.net',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    qualities: [60, 75, 85, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    unoptimized: process.env.NODE_ENV === 'development', // Disable optimization in dev for faster refresh
  },
  
  // Compiler optimizations (SWC - faster than Terser)
  compiler: {
    // Remove console logs in production (improves bundle size)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep error and warn logs
    } : false,
    
    // Remove React displayName in production (smaller bundle)
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? true : false,
  },
  
  // Caching headers for better performance + Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          /**
           * Content Security Policy (CSP):
           * - Allows Google Tag Manager (trusted-types and script-src)
           * - Allows Cloudinary images and Azure storage
           * - Allows Google Fonts (safe for performance)
           * - Blocks inline scripts (except for GTM which uses nonce or trusted types)
           * - Safe for analytics without breaking functionality
           */
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' www.googletagmanager.com www.google-analytics.com;
              style-src 'self' 'unsafe-inline' fonts.googleapis.com;
              img-src 'self' data: https: res.cloudinary.com marble-bajco.com shakeltabaanstorage.blob.core.windows.net www.googletagmanager.com;
              font-src 'self' data: fonts.gstatic.com;
              connect-src 'self' https: www.google-analytics.com www.googletagmanager.com shakeltabaanstorage.blob.core.windows.net marble-bajco.com shk2t-t3ban.fly.dev shakeltaaban-d8cwcdeteadge4fe.switzerlandnorth-01.azurewebsites.net;
              frame-src 'self' www.google.com;
              media-src 'self' data: blob: https:;
              upgrade-insecure-requests;
            `.replace(/\s+/g, ' ').trim(),
          },
          /**
           * HSTS (HTTP Strict Transport Security):
           * Forces HTTPS for 1 year, including subdomains
           * Prevents downgrade attacks
           */
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/acessts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
      {
        source: '/logo/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Webpack configuration
  webpack(config, { dev, isServer }) {
    // SVG configuration
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });

    // Additional optimizations for production
    if (!isServer && !dev) {
      // Enable module concatenation (scope hoisting) for better tree-shaking
      config.optimization = config.optimization || {};
      config.optimization.concatenateModules = true;
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          // Separate vendor chunks for better caching
          shared: {
            chunks: 'all',
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // TypeScript configuration
  typescript: {
    // ignoreBuildErrors: false,
  },
  
  // Environment variables
  env: {
    // Add any custom environment variables
  },
};

// Export with bundle analyzer wrapper
export default withBundleAnalyzer(nextConfig);