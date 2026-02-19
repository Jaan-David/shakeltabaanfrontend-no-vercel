// config/seo.config.ts - Complete SEO Configuration

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

export const canonicalBaseUrl = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shkelteaban.com'
);

export const seoConfig = {
  siteName: 'شق التعبان',
  siteDescription: "اول واكبر منصة للرخام",
  defaultLanguage: 'ar',
  
  // Social Media Links
  socialLinks: {
    facebook: 'https://facebook.com/shakeltaaban',
    twitter: 'https://twitter.com/shakeltaaban',
    instagram: 'https://instagram.com/shakeltaaban',
    linkedin: 'https://linkedin.com/company/shakeltaaban',
    youtube: 'https://youtube.com/@shakeltaaban',
  },
  
  // Contact Information
  contact: {
    email: '',
    phone: '+',
    address: '',
  },

  // Default Images for Social Sharing
  images: {
    ogImage: '/og-image.jpg',
    twitterImage: '/twitter-image.jpg',
    logo: '/logo/logo1.png',
    favicon: '/logo/logo1.png', // Updated to use logo1.png for all icon variants
  },
  
  // Default Keywords
  defaultKeywords: [
    'ShakElTaaban',
    'شق الثعبان',
    'شق التعبان',
    'شقه تعبان',
    'رخام',
    'جرانيت',
    'رخام شق التعبان',
    'جرانيت شق التعبان',
    'كيماويات',
    'كيماويات البناء',
    'دهانات',
    'كيماويات الصباغة',
    'مستحضرات التجميل',
    'منظفات',
    'تجارة كيماويات',
    'مواد بناء',
    'القاهرة',
  ],
  
  // Robots Configuration
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // OpenGraph Defaults
  openGraph: {
    type: 'website' as const,
    locale: 'ar_EG',
    siteName: 'ShakElTaaban - شق الثعبان',
  },
  
  // Twitter Card Defaults
  twitter: {
    card: 'summary_large_image' as const,
    site: '@shakeltaaban',
    creator: '@shakeltaaban',
  },
  
  // Verification Codes (Add your own when you have them)
  verification: {
    google: '', // Add when you verify with Google Search Console
    yandex: '',
    bing: '',
  },
};

// ============================================
// HELPER FUNCTION: Generate SEO Metadata
// ============================================
export const generateSEO = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  noIndex = false,
}: {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}) => {
  const baseUrl = canonicalBaseUrl;
  const normalizedUrl = url?.startsWith('http') ? url : url ? `${baseUrl}${url}` : baseUrl;
  const normalizeImage = (value?: string) => {
    if (!value) return `${baseUrl}${seoConfig.images.ogImage}`;
    return value.startsWith('http')
      ? value
      : `${baseUrl}${value.startsWith('/') ? value : `/${value}`}`;
  };
  const ogImage = normalizeImage(image || seoConfig.images.ogImage);
  const twitterImage = normalizeImage(image || seoConfig.images.twitterImage);
  const normalizedType = type === 'product' ? 'article' : type;
  const mergedKeywords = Array.from(new Set([...seoConfig.defaultKeywords, ...keywords]));
  
  return {
    title,
    description: description || seoConfig.siteDescription,
    keywords: mergedKeywords,
    robots: noIndex ? { index: false, follow: false } : seoConfig.robots,
    openGraph: {
      ...seoConfig.openGraph,
      title: `${title} | ${seoConfig.siteName}`,
      description: description || seoConfig.siteDescription,
      url: normalizedUrl,
      type: normalizedType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      ...seoConfig.twitter,
      title: `${title} | ${seoConfig.siteName}`,
      description: description || seoConfig.siteDescription,
      images: [twitterImage],
    },
    alternates: {
      canonical: normalizedUrl,
      languages: {
        'ar': normalizedUrl,
        'en': `${baseUrl}/en${url || ''}`,
        'x-default': baseUrl,
      },
    },
  };
};

// ============================================
// Organization Schema
// ============================================
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': seoConfig.siteName,
  'description': seoConfig.siteDescription,
  'url': canonicalBaseUrl,
  'logo': `${canonicalBaseUrl}${seoConfig.images.logo}`,
  'contactPoint': {
    '@type': 'ContactPoint',
    'telephone': seoConfig.contact.phone,
    'contactType': 'Customer Service',
    'email': seoConfig.contact.email,
    'availableLanguage': ['Arabic', 'English'],
    'areaServed': 'EG',
  },
  'address': {
    '@type': 'PostalAddress',
    'addressCountry': 'EG',
    'addressLocality': 'Cairo',
    'streetAddress': seoConfig.contact.address,
  },
  'sameAs': Object.values(seoConfig.socialLinks),
};

// ============================================
// Website Schema
// ============================================
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': seoConfig.siteName,
  'description': seoConfig.siteDescription,
  'url': canonicalBaseUrl,
  'potentialAction': {
    '@type': 'SearchAction',
    'target': {
      '@type': 'EntryPoint',
      'urlTemplate': `${canonicalBaseUrl}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  'inLanguage': 'ar',
};

// ============================================
// Breadcrumb Helper
// ============================================
export const generateBreadcrumb = (items: Array<{ name: string; url: string }>) => {
  const baseUrl = canonicalBaseUrl;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': `${baseUrl}${item.url}`,
    })),
  };
};