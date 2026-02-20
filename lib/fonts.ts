import { Cairo, Harmattan, Amiri } from 'next/font/google';
import localFont from 'next/font/local';

/**
 * GOOGLE FONTS - Optimized with font-display: swap
 * These fonts are loaded asynchronously without blocking render
 */

export const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cairo',
  display: 'swap', // Show fallback immediately, swap when ready
  preload: true,
});

export const harmattan = Harmattan({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700'],
  variable: '--font-harmattan',
  display: 'swap',
  preload: true,
});

export const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
  preload: true,
});

/**
 * SELF-HOSTED BEIRUTI - WOFF2 only (production optimized)
 * 
 * ✅ PRODUCTION: Using WOFF2 only for best performance
 * TTF fallback removed for reduced HTTP requests
 * 
 * Expected performance: -500-800ms on FCP vs mixed TTF+WOFF2
 */
export const beiruti = localFont({
  src: [
    // Weight 200 (Regular)
    {
      path: '../public/fonts/beiruti/static/subset-Beiruti-Regular.woff2',
      weight: '200',
      style: 'normal',
    },
    // Weight 300 (Medium)
    {
      path: '../public/fonts/beiruti/static/subset-Beiruti-Medium.woff2',
      weight: '300',
      style: 'normal',
    },
    // Weight 400 (SemiBold)
    {
      path: '../public/fonts/beiruti/static/subset-Beiruti-SemiBold.woff2',
      weight: '400',
      style: 'normal',
    },
    // Weight 500 (Bold)
    {
      path: '../public/fonts/beiruti/static/subset-Beiruti-Bold.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-beiruti',
  display: 'swap',
});

/**
 * Combined font family variable for use in CSS
 * Removes all Google Fonts @import blocks
 * System fonts act as fallback for guaranteed text visibility
 */
export const fontVariables = [
  cairo.variable,
  harmattan.variable,
  amiri.variable,
  beiruti.variable,
].join(' ');
