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
 * SELF-HOSTED BEIRUTI - Initially uses TTF, upgrades to WOFF2 when available
 * 
 * ⏳ PENDING: WOFF2 conversion - Once you convert TTF to WOFF2 and place files
 * in /public/fonts/beiruti/static/, update the src paths below to use .woff2
 * 
 * The src array loads TTF files. Once converted to WOFF2, simply update paths.
 * Modern browsers will prefer WOFF2 if available (when you convert the files).
 * 
 * TO OPTIMIZE: Convert TTF → WOFF2 using transfonter.org
 */
export const beiruti = localFont({
  src: [
    // Weight 200 (Regular)
    {
      path: '../public/fonts/beiruti/static/Beiruti-Regular.ttf',
      weight: '200',
      style: 'normal',
    },
    // Weight 300 (Medium)
    {
      path: '../public/fonts/beiruti/static/Beiruti-Medium.ttf',
      weight: '300',
      style: 'normal',
    },
    // Weight 400 (SemiBold)
    {
      path: '../public/fonts/beiruti/static/Beiruti-SemiBold.ttf',
      weight: '400',
      style: 'normal',
    },
    // Weight 500 (Bold)
    {
      path: '../public/fonts/beiruti/static/Beiruti-Bold.ttf',
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
