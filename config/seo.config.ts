// config/seo.config.ts - Complete SEO Configuration

export const seoConfig = {
  siteName: 'شق الثعبان',
  siteDescription: "منصة شق الثعبان تربطك بمصانع ومعارض الرخام والجرانيت والكوارتز في مصر",
  defaultTitle: "شق الثعبان | رخام وجرانيت وكوارتز في مصر",
  defaultLanguage: 'ar',
  brandVariants: [
    'شق الثعبان',
    'شق التعبان',
    'شق تعبان',
    'شقت تعبان',
    'shak el taaban',
    'shak el thoban',
    'shek el thoban',
  ],
  keywordGroups: {
    arabicCore: [
      'رخام',
      'جرانيت',
      'كوارتز',
      'سعر متر الرخام',
      'اسعار الرخام اليوم',
      'مصانع رخام',
      'معارض رخام',
      'رخام مطابخ',
      'رخام ارضيات',
      'رخام تشطيب',
      'الفرق بين الرخام والجرانيت',
      'افضل نوع رخام',
    ],
    arabicMisspellings: [
      'الرخم',
      'رخامه',
      'كوارتس',
      'كوارترز',
      'جرانيت مطابخ',
      'رخام شقق',
      'رخام فلل',
    ],
    internationalEnglish: [
      'Marble Egypt',
      'Granite Egypt',
      'Quartz Egypt',
      'Marble Suppliers',
      'Stone Marketplace',
      'Granite Countertop Prices',
      'Quartz Countertops',
      'Buy Marble Online',
      'Custom Stone Cutting',
      'Marble Slabs Export',
    ],
    francoArabic: [
      'rokham',
      'granit',
      'kwartez',
      'shak el taaban',
      'rokham masry',
      'rokham matabekh',
    ],
  },
  
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
    ogImage: '/logo/logo2.png',
    twitterImage: '/logo/logo2.png',
    logo: '/logo1.png',
    favicon: '/logo/logo2.png',
  },
  
  // Default Keywords
  defaultKeywords: [
    'شق الثعبان',
    'رخام شق الثعبان',
    'مصانع رخام شق الثعبان',
    'معرض رخام',
    'مصانع رخام',
    'رخام مصري',
    'جرانيت مصري',
    'كوارتز',
    'اسعار الرخام',
    'سعر متر الرخام',
    'شق التعبان',
    'شق تعبان',
    'شقت تعبان',
    'الرخم',
    'اسعار الرخم',
    'Marble Egypt',
    'Granite Egypt',
    'Quartz Egypt',
    'shak el taaban',
    'shak el thoban',
    'shek el thoban',
  ],
  
  // Robots Configuration
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  } as const,
  
  // OpenGraph Defaults
  openGraph: {
    type: 'website' as const,
    locale: 'ar_EG',
    siteName: 'شق الثعبان',
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const ogImage = image || `${baseUrl}${seoConfig.images.ogImage}`;
  const resolvedTitle = title.trim() || seoConfig.defaultTitle;
  const resolvedDescription = description?.trim() || seoConfig.siteDescription;
  const mergedKeywords = Array.from(
    new Set([...seoConfig.defaultKeywords, ...keywords])
  );
  
  const resolvedType = type === 'article' ? type : 'website';

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: mergedKeywords,
    robots: noIndex ? { index: false, follow: false } : seoConfig.robots,
    openGraph: {
      ...seoConfig.openGraph,
      title: `${resolvedTitle} | ${seoConfig.siteName}`,
      description: resolvedDescription,
      url: fullUrl,
      type: resolvedType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: resolvedTitle,
        },
      ],
    },
    twitter: {
      ...seoConfig.twitter,
      title: `${resolvedTitle} | ${seoConfig.siteName}`,
      description: resolvedDescription,
      images: [image || `${baseUrl}${seoConfig.images.twitterImage}`],
    },
    alternates: {
      canonical: fullUrl,
      languages: {
        'ar': fullUrl,
        'en': `${baseUrl}/en${url || ''}`,
        'x-default': fullUrl,
      },
    },
    other: {
      'geo.region': 'EG',
      'geo.placename': 'Cairo',
      'geo.position': '30.0444;31.2357',
      'ICBM': '30.0444, 31.2357',
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
  'url': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  'logo': `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${seoConfig.images.logo}`,
  'contactPoint': {
    '@type': 'ContactPoint',
    'telephone': seoConfig.contact.phone,
    'contactType': 'Customer Service',
    'email': seoConfig.contact.email,
    'availableLanguage': ['Arabic', 'English'],
    'areaServed': ['EG', 'SA', 'AE', 'KW', 'LY', 'JO'],
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
  'url': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  'potentialAction': {
    '@type': 'SearchAction',
    'target': {
      '@type': 'EntryPoint',
      'urlTemplate': `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  'inLanguage': 'ar',
};

// ============================================
// Breadcrumb Helper
// ============================================
export const generateBreadcrumb = (items: Array<{ name: string; url: string }>) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const toAbsoluteUrl = (value: string) => {
    if (!value) return baseUrl;
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    const normalized = value.startsWith('/') ? value : `/${value}`;
    return `${baseUrl}${normalized}`;
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': toAbsoluteUrl(item.url),
    })),
  };
};