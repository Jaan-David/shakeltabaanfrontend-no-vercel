// app/layout.tsx - Server Component with SEO Config
import "./globals.css";
import AppShell from "@/components/Layout/AppShell";
// import GoogleTranslate from "@/components/Layout/Translator/GoogleTranslator";
import ClientProviders from "@/components/providers/ClientProvider";
import { Metadata } from "next";
import Script from "next/script";
import { canonicalBaseUrl, seoConfig, organizationSchema, websiteSchema } from "@/config/seo.config";

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
  alternates: {
    canonical: '/',
    languages: {
      ar: '/',
      en: '/en',
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
        width: 1200,
        height: 630,
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
      { url: seoConfig.images.favicon, sizes: '32x32', type: 'image/png' },
      { url: seoConfig.images.favicon, sizes: '48x48', type: 'image/png' },
      { url: seoConfig.images.favicon, sizes: '192x192', type: 'image/png' },
    ],
    shortcut: seoConfig.images.favicon,
    apple: {
      url: seoConfig.images.favicon,
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
    <html lang={seoConfig.defaultLanguage} dir="rtl" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/beiruti/static/Beiruti-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />

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