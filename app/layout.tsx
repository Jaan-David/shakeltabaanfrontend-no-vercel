// app/layout.tsx - Server Component with SEO Config
import "./globals.css";
import "keen-slider/keen-slider.min.css";
import AppShell from "@/components/Layout/AppShell";
// import GoogleTranslate from "@/components/Layout/Translator/GoogleTranslator";
import ClientProviders from "@/components/providers/ClientProvider";
import { Metadata } from "next";
import Script from "next/script";
import { canonicalBaseUrl, seoConfig, organizationSchema, websiteSchema } from "@/config/seo.config";
import { fontVariables } from "@/lib/fonts";

// ============================================
// ROOT METADATA (SEO) - Using Config
// ============================================
export const metadata: Metadata = {
  title: {
    default: `${seoConfig.siteName} | ${seoConfig.siteDescription.substring(0, 60)}...`,
    template: `%s | ${seoConfig.siteName}`
  },
  description: seoConfig.siteDescription,
  keywords: seoConfig.defaultKeywords,
  authors: [{ name: seoConfig.siteName }],
  creator: seoConfig.siteName,
  publisher: seoConfig.siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(canonicalBaseUrl),
  manifest: '/site.webmanifest',
  alternates: {
    canonical: '/',
    languages: {
      ar: '/',
      'x-default': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: '/',
    siteName: seoConfig.siteName,
    title: seoConfig.siteName,
    description: seoConfig.siteDescription,
    images: [
      {
        url: seoConfig.images.ogImage,
        width: 677,
        height: 369,
        alt: `${seoConfig.siteName} Logo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.siteName,
    description: seoConfig.siteDescription,
    images: [seoConfig.images.twitterImage],
    site: seoConfig.twitter.site,
    creator: seoConfig.twitter.creator,
  },
  icons: {
    icon: [
      { url: '/logo/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/logo/app-icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/logo/favicon-32.png',
    apple: {
      url: '/logo/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
  verification: seoConfig.verification,
};

// ============================================
// VIEWPORT CONFIGURATION
// ============================================
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F1F4F8' },
    { media: '(prefers-color-scheme: dark)', color: '#0A1E33' },
  ],
};

// ============================================
// ROOT LAYOUT (Server Component)
// ============================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={seoConfig.defaultLanguage} dir="rtl" suppressHydrationWarning className={fontVariables}>
      <head>
        {/* Critical CSS - Inline above-the-fold styles for faster FCP/LCP */}
        <style dangerouslySetInnerHTML={{__html: `
          body{margin:0;background:#fff;color:#0f172a;overflow-x:hidden}
          .antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
          img{display:block;max-width:100%;height:auto}
        `}} />
        
        {/* LCP Image Preload - Hero image with responsive formats (WebP/AVIF priority) */}
        <link
          rel="preload"
          as="image"
          href="/_next/image?url=%2Fslider%2F1.jpg&w=640&q=60"
          imageSrcSet="/_next/image?url=%2Fslider%2F1.jpg&w=640&q=60 640w, /_next/image?url=%2Fslider%2F1.jpg&w=750&q=60 750w, /_next/image?url=%2Fslider%2F1.jpg&w=828&q=60 828w, /_next/image?url=%2Fslider%2F1.jpg&w=1080&q=60 1080w, /_next/image?url=%2Fslider%2F1.jpg&w=1200&q=60 1200w, /_next/image?url=%2Fslider%2F1.jpg&w=1920&q=60 1920w"
          imageSizes="100vw"
          fetchPriority="high"
        />
        
        {/* DNS Prefetch & Preconnect for critical external resources */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Contact Information (for search engines) */}
        <meta name="contact" content={seoConfig.contact.email} />
        <meta name="geo.region" content="EG-C" />
        <meta name="geo.placename" content="Cairo" />
      </head>
      
      <body className="antialiased" suppressHydrationWarning={true}>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-8V17H7W98Z"
          strategy="afterInteractive"
        />
        <Script id="ga-gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-8V17H7W98Z');`}
        </Script>

        {/* Google Translate - Temporarily disabled due to chunk loading issues */}
        {/* <GoogleTranslate pageLanguage={seoConfig.defaultLanguage} /> */}

        {/* All Client Providers */}
        <ClientProviders>
          <AppShell>
            {children}
          </AppShell>
        </ClientProviders>

        {/* Organization Schema (using config) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />

        {/* Website Schema (using config) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />

        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              'name': seoConfig.siteName,
              'description': seoConfig.siteDescription,
              'image': `${canonicalBaseUrl}${seoConfig.images.logo}`,
              'telephone': seoConfig.contact.phone,
              'email': seoConfig.contact.email,
              'address': {
                '@type': 'PostalAddress',
                'streetAddress': seoConfig.contact.address,
                'addressLocality': 'Cairo',
                'addressCountry': 'EG'
              },
              'geo': {
                '@type': 'GeoCoordinates',
                'latitude': 30.0444,
                'longitude': 31.2357
              },
              'url': canonicalBaseUrl,
              'sameAs': Object.values(seoConfig.socialLinks),
              'priceRange': '$$',
              'openingHours': 'Mo-Su 09:00-18:00',
            })
          }}
        />
      </body>
    </html>
  );
}