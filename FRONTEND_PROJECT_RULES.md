# FRONTEND_PROJECT_RULES.md

**Last Updated:** February 3, 2026  
**Status:** Permanent Reference - Mandatory for All Changes

---

## PROJECT QUICK SUMMARY

**Project Name:** ShakElTaaban Frontend  
**Framework:** Next.js 15.5.9 (App Router)  
**Language:** TypeScript + React 18  
**Styling:** Tailwind CSS + Custom CSS Modules  
**State Management:** React Context (ClientProvider, SessionProvider, AlertProvider)  
**Authentication:** NextAuth.js v4 + Firebase + Google OAuth  
**HTTP Client:** Axios  
**Animations:** GSAP, Motion, Keen Slider  
**Hosting/Deployment:** Configured for production build

### Core Tech Stack

```json
{
  "framework": "Next.js (App Router)",
  "ui": "React 18 + TypeScript",
  "styling": "Tailwind CSS + CSS Modules",
  "auth": "NextAuth.js + Firebase + Google OAuth",
  "http": "Axios",
  "animations": "GSAP + Motion",
  "icons": "Lucide React + React Icons",
  "notifications": "React Toastify",
  "slider": "Keen Slider"
}
```

### Project Structure Overview

```
app/                      # Next.js App Router (routes & layouts)
├── (auth)/               # Auth routes group
├── api/                   # API route handlers
├── page.tsx             # Home page
└── layout.tsx           # Root layout (metadata, providers)

components/              # Reusable UI components
├── Layout/              # AppShell, Nav, Translator
├── UI/                   # Atomic components
├── providers/           # Context providers

services/               # API integration layer
├── api/                 # API endpoints (NO direct fetch in components!)
├── auth/                # Auth logic
├── product/             # Product services
└── Utils/               # Service utilities

pages/                   # Smart page components (data fetching)
├── HomePage/
├── ProductPage/
└── ...

utils/                  # Pure utility functions
lib/                    # Third-party integration helpers
config/                 # Config files (seo.config.ts, constants)
public/                 # Static assets
```

### Critical Architecture Rules

- **App Router Only:** All routes must use `app/` directory (Next.js 15)
- **Server Components Default:** Use Server Components unless you need interactivity
- **Client Components:** Mark with `'use client'` only when needed (state, hooks, events)
- **Layout Structure:** Root layout handles metadata, providers, AppShell
- **No Direct Fetch in Components:** ALL HTTP requests → services/ → hooks/components
- **Context Providers:** ClientProvider wraps app (SessionProvider, AlertProvider)
- **Auth:** NextAuth.js configured with Google OAuth + Firebase

---

---

## CURRENT THEME STATUS (February 3, 2026)

### 🎨 Blue & White Theme Implementation - ACTIVE

**Theme Status:** ✅ COMPLETE AND DEPLOYED  
**Primary Color:** #2563EB (Blue-600)  
**Secondary Colors:** #1D4ED8 (Blue-700), #1E40AF (Blue-800)  
**Background:** #FFFFFF (White)  
**Text Primary:** #0F172A (Slate-900)  
**Text Secondary:** #475569 (Slate-600)  
**Borders:** #E5E7EB (Gray-200)

### Files Updated with Blue & White Theme

**Core Configuration:**
- ✅ `tailwind.config.ts` - Color palette with semantic names (primary, surface, text)
- ✅ `app/globals.css` - CSS variables (--brand, --surface, --text-1, --border, etc.)

**Component Styling:**
- ✅ `components/UI/Buttons/Button.tsx` - Blue button variants (primary, secondary, outline)
- ✅ `components/UI/Card/card.module.css` - White cards (#FFFFFF) with blue accents
- ✅ `components/Layout/Nav/Header.module.css` - Blue navigation links (#2563EB)
- ✅ `app/(auth)/auth.module.css` - Blue auth page gradients and links
- ✅ `pages/CategoriesPage/CategoriesGrid.module.css` - Blue category title gradients
- ✅ `components/UI/Chekout/Style.module.css` - Blue checkout button gradients
- ✅ `components/UI/stepper/Stepper.css` - Blue stepper active dots

**Pages Updated:**
- ✅ `pages/HomePage/HomeContent.tsx` - Complete conversion from dark purple to blue & white:
  - Main background: white (was dark purple gradient)
  - Hero section: blue gradient (was slate-900 gradient)
  - Overlay box: white with blue border (was dark with white border)
  - Titles: blue gradient text (was white)
  - Subtitles: dark slate text (was gray)
  - Buttons: solid blue (was blue-to-purple gradients)
  - Search input: white with blue border (was dark transparent)
  - Product cards: dark slate text (was white)

### Color Conversion Reference

| Element | Old Color | New Color | Tailwind Class |
|---------|-----------|-----------|----------------|
| Primary Button | blue-to-purple gradient | #2563EB | bg-blue-600 hover:bg-blue-700 |
| Card Background | #1E293B (dark) | #FFFFFF | bg-white |
| Text on Light | #FFFFFF (white) | #0F172A | text-slate-900 |
| Borders | #334155 (dark) | #E5E7EB | border-gray-200 |
| Hero Background | #0F172A → #2563EB | #2563EB → #60A5FA | bg-gradient-to-br from-blue-600 |
| Hover State | #1D4ED8 | #1D4ED8 | hover:bg-blue-700 |

### Design System Compliance

✅ **Tailwind CSS Variables:**
- All colors defined in `tailwind.config.ts` under `theme.extend.colors`
- Semantic naming: `primary`, `surface`, `text`, `border`
- No hardcoded hex colors in components (use Tailwind classes)
- CSS custom properties in `globals.css` for legacy support

✅ **No Inline Styles:**
- All styling via Tailwind utility classes
- Dynamic values only via `style=` prop when necessary
- CSS Modules used for complex component styling

✅ **Responsive Design:**
- Mobile-first approach maintained
- Breakpoints: xs (475px), sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch targets minimum 44x44px

---

## 1. General Principles

### Code Quality & Consistency

- **Code readability MUST always take priority over cleverness.**
- **Consistency is mandatory.** Every developer MUST follow the same patterns.
- **No breaking changes without approval** from tech lead.
- **DRY and SOLID principles** are non-negotiable.
- **Type Safety First:** Use TypeScript strict mode. NO `any` types.
- **Next.js Best Practices:** Use App Router, Server Components by default, optimize images.

### Project-Specific Standards

- **Framework:** Next.js 15 (App Router ONLY - `/app` folder)
- **Language:** TypeScript (strict mode enabled)
- **Authentication:** NextAuth.js + Firebase (see `services/auth/`)
- **Styling:** Tailwind CSS (primary) + CSS Modules (for complex components)
- **HTTP Client:** Axios (centralized in `services/api/`)
- **State:** React Context (ClientProvider, SessionProvider, AlertProvider)
- **Metadata:** SEO config in `config/seo.config.ts` (used in root layout)

---

---

## 2. Next.js App Router Rules (CRITICAL)

### Server vs Client Components

```typescript
// ✅ CORRECT: Server Component (default)
// app/products/page.tsx
import ProductList from '@/components/Product/ProductList';

export default async function ProductsPage() {
  const products = await fetch('...').then(r => r.json());
  return <ProductList products={products} />;
}

// ✅ CORRECT: Client Component (only when needed)
// components/Product/ProductCard.tsx
'use client';

import { useState } from 'react';

export default function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);
  return <div>{...}</div>;
}

// ❌ INCORRECT: Unnecessary 'use client'
'use client';
export default function StaticList() {
  return <ul>{/* static list */}</ul>;
}
```

**Rules:**
- **MUST use Server Components by default** (no `'use client'`)
- **ONLY add `'use client'` when you need:** state, hooks, event listeners, Context
- **NO data fetching in Client Components** - fetch in Server Components or services
- **Layouts MUST be Server Components** unless they use Context
- **Page components MUST be Server Components** unless they need interactivity
- **Move `'use client'` as deep as possible** in component tree

### Layout & Metadata

```typescript
// ✅ CORRECT: Root layout with metadata & providers
// app/layout.tsx
import { metadata } from '@/config/seo.config';
import ClientProviders from '@/components/providers/ClientProvider';
import AppShell from '@/components/Layout/AppShell';

export const metadata = { /* ... */ };

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClientProviders>
          <AppShell>
            {children}
          </AppShell>
        </ClientProviders>
      </body>
    </html>
  );
}

// ✅ CORRECT: Nested layout
// app/dashboard/layout.tsx
export const metadata = { title: 'Dashboard' };

export default function DashboardLayout({ children }) {
  return <div className="dashboard-layout">{children}</div>;
}
```

**Rules:**
- **Metadata MUST come from `config/seo.config.ts`** (centralized)
- **Root layout MUST wrap with ClientProviders** (Session, Alert, etc.)
- **Root layout MUST include AppShell** (Nav, Layout)
- **Use `generateMetadata()` for dynamic metadata** in page components
- **Never hardcode metadata** - always reference config

---

---

## 3. Naming Conventions

**Rules:**
- **Components:** PascalCase.tsx (e.g., `ProductCard.tsx`, `NavBar.tsx`)
- **Hooks:** camelCase prefixed with `use` (e.g., `useCart.ts`)
- **Services:** camelCase (e.g., `productService.ts`)
- **Booleans:** Start with `is`, `has`, `can`, `should` (e.g., `isLoading`, `hasError`)
- **Event handlers:** Start with `handle` (e.g., `handleClick`, `handleSubmit`)
- **Async functions:** Clear naming (e.g., `fetchData`, `loadUser`, NOT `getUser`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_ITEMS`, `API_BASE_URL`)
- **Folders:** PascalCase for components, kebab-case for routes
- **API methods:** `fetchResource()`, `createResource()`, `updateResource()`, `deleteResource()`
- **Abbreviations:** MUST NOT use (except ID, URL, API)

---

---

## 4. Component Rules

**Single Responsibility:**
- One component = one job
- Max file size: 300 lines (excluding types)
- Split if: nesting > 4 levels OR logic > 150 lines OR multiple purposes

**Props Typing (MANDATORY):**
- ALL props MUST be typed with interfaces
- NO `any` types (use `unknown` if needed, then narrow)
- Props interfaces defined outside component or in separate types file
- Event handlers use `onAction` pattern (e.g., `onClick`, `onChange`)

**JSX Rules:**
- NO complex ternary operators (max 1 level nesting)
- Extract complex logic to hooks/utils
- NO `.map()` with complex logic inline
- Use constants for conditional rendering

**Server vs Client Components:**
- Page components: Server Components (default)
- Interactive components: Client Components (`'use client'`)
- Share data via props, NOT context (when possible)

---

---

## 5. State Management

**Local State (useState):**
- Form inputs
- UI toggles (modals, dropdowns)
- Component-specific temp states
- Animation states

**Context (Global State):**
- User authentication (SessionProvider)
- User profile
- Cart/favorites
- Notifications (AlertProvider)
- Theme/language

**Rules:**
- Start with local state, only move to global if needed in 2+ unrelated components
- Never store API responses in global state if component-specific
- Context should be minimal (max 3 levels nesting)
- Use Context Providers at appropriate level (not always root)

---

---

## 6. API & Data Fetching (CRITICAL)

### API Service Pattern

**Location:** `services/api/` (centralized)  
**HTTP Client:** Axios  
**NO API calls in components** - MANDATORY

```typescript
// ✅ CORRECT: Service layer
// services/api/productService.ts
import axios from 'axios';

export const productService = {
  async fetchProducts(page = 1): Promise<Product[]> {
    const { data } = await axios.get('/api/products', { params: { page } });
    return validateProducts(data);
  },
  
  async fetchProductById(id: string): Promise<Product> {
    const { data } = await axios.get(`/api/products/${id}`);
    return validateProduct(data);
  },
};

// ✅ CORRECT: Use in components via hooks
// components/ProductList.tsx
'use client';

const ProductList = ({ page }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await productService.fetchProducts(page);
        setProducts(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [page]);

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <div>{/* render products */}</div>;
};
```

**Rules:**
- **ALL API calls in `services/api/`** - NO direct fetch/axios in components
- **Use Axios** (already in project)
- **Validate ALL responses** before using
- **Handle loading, error, success states** explicitly
- **Cleanup functions in useEffect** to prevent memory leaks
- **API endpoints as constants** in services or config

### Response Validation

```typescript
// ✅ CORRECT: Validate before returning
const validateProduct = (data: unknown): Product => {
  if (!data || typeof data !== 'object') throw new Error('Invalid product');
  const product = data as Record<string, unknown>;
  if (typeof product.id !== 'string') throw new Error('Missing id');
  if (typeof product.name !== 'string') throw new Error('Missing name');
  return product as Product;
};
```

**Rules:**
- Validate structure, types, required fields
- Throw errors on validation failure
- Use runtime validation (Zod, io-ts) for complex APIs

---

---

## 7. Styling Rules

**Framework:** Tailwind CSS (primary) + CSS Modules (for complex components)

**Rules:**
- Use Tailwind utilities for all standard styling
- NO inline styles unless dynamic (width, height, colors from data)
- NO hardcoded CSS without Tailwind - use utility classes
- CSS classes: kebab-case (e.g., `.product-card`)
- BEM naming for complex components (e.g., `.product-card__header`)
- State classes: `is-active`, `has-error`, `is-loading`
- Responsive: Mobile-first (start with base, add `md:`, `lg:`, `xl:`)
- Test breakpoints: 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide)
- Touch targets: min 44x44px on mobile
- No horizontal scroll on mobile

**Tailwind Usage:**
```tsx
// ✅ CORRECT
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-lg">
  <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
</div>

// ✅ ACCEPTABLE: Dynamic values
<div style={{ width: `${percentage}%` }} className="bg-blue-500 h-2" />

// ❌ INCORRECT: Inline styles for static values
<div style={{ display: 'flex', gap: '16px', padding: '16px' }}>
```

---

---

## 8. Performance Rules

**Memoization:**
- Only memoize if: props are objects/arrays OR component renders expensive content
- Use `memo()` sparingly - verify with React DevTools Profiler first
- Wrap callbacks with `useCallback` if passed to memoized children
- Use `useMemo` only for expensive calculations

**Re-renders:**
- Dependencies MUST be correct in useEffect/useCallback/useMemo
- Avoid creating new objects/arrays in render (define outside)
- Event handlers passed to children MUST use useCallback
- Use stable keys (NOT index) in dynamic lists

**Code Splitting & Lazy Loading:**
- Use `React.lazy()` + `Suspense` for heavy pages/modals
- Enable bundle analysis: `ANALYZE=true npm run build`
- Target initial bundle < 100KB
- Use `next/image` for all images (auto-optimization)
- Prefetch critical chunks before user interaction

---

---

## 9. Error Prevention Checklist

### Before Every Commit

```
CODE QUALITY
□ No console.log/debugger statements
□ No commented-out code
□ No any types used
□ Max file size 300 lines
□ Naming conventions followed
□ No code duplication

FUNCTIONALITY  
□ Component renders without errors
□ Props are typed correctly
□ Error states handled
□ Loading states shown
□ Empty states have UI
□ API calls have error handling
□ Auth-required routes protected

PERFORMANCE
□ No unnecessary re-renders
□ Images use next/image
□ Bundle size OK
□ Large components lazy-loaded
□ No memory leaks (useEffect cleanup)

RESPONSIVE & BROWSER
□ Mobile responsive (375px+)
□ Tested on Chrome, Firefox, Safari
□ No horizontal scroll on mobile
□ Touch targets 44x44px min
□ No console errors

SECURITY
□ No hardcoded secrets
□ Environment variables for config
□ API responses validated
□ Input sanitized
□ Auth checks on protected routes
```

### Common Mistakes to Avoid

| Error | Fix |
|-------|-----|
| Missing error boundaries | Wrap pages with `<ErrorBoundary>` |
| No keys in lists | Always use stable, unique keys (NOT index) |
| Missing dependencies | Use ESLint: exhaustive-deps |
| Mutating state directly | Create new objects/arrays |
| Not handling null/undefined | Add null checks & optional chaining |
| Memory leaks | Cleanup functions in useEffect |
| Swallowed errors | Log all errors, don't ignore |
| API calls in components | MUST use services/ layer |
| Hardcoded strings | Extract to constants/config |
| Type any | Use unknown, then narrow |

---

## 10. Quick Reference

### File Structure Map
```
app/              → Routes & layouts (Next.js App Router)
components/       → Reusable UI pieces (presentational)
pages/            → Smart components (data fetching)
services/api/     → ALL API calls go here
hooks/            → Custom React hooks (reusable)
utils/            → Pure utility functions
config/           → Constants, metadata, SEO
```

### Imports Pattern
```typescript
// Import order (enforced by prettier/eslint):
import { useState } from 'react';                          // React
import { useRouter } from 'next/navigation';              // Next.js
import { productService } from '@/services/api/..';       // Services
import { Button } from '@/components/UI/...';             // Components
import { formatPrice } from '@/utils/...';                // Utils
import { API_BASE_URL } from '@/config/...';              // Config
```

### Component Template
```typescript
'use client'; // Add ONLY if needed (state, hooks, events)

import { useState } from 'react';
import type { ComponentProps } from '@/types/...';

interface MyComponentProps {
  title: string;
  onAction?: (id: string) => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClick = () => {
    setIsOpen(!isOpen);
    onAction?.();
  };

  return (
    <div className="component-class">
      <h2>{title}</h2>
      <button onClick={handleClick}>Toggle</button>
    </div>
  );
}
```

### Service Template  
```typescript
// services/api/productService.ts
import axios from 'axios';

const API_URL = '/api/products';

export const productService = {
  async fetchAll(): Promise<Product[]> {
    try {
      const { data } = await axios.get(API_URL);
      return validateProducts(data);
    } catch (error) {
      console.error('Fetch products failed:', error);
      throw error;
    }
  },
};

const validateProducts = (data: unknown): Product[] => {
  if (!Array.isArray(data)) throw new Error('Invalid response');
  return data.map(validateProduct);
};
```

### Common Patterns

**Data Fetching:**
```typescript
'use client';
const [data, setData] = useState<T | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  const fetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await service.fetch();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  fetch();
}, []);
```

**Conditional Rendering:**
```typescript
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;
return <Content data={data} />;
```

**Form Handling:**
```typescript
'use client';
const [formData, setFormData] = useState({ name: '', email: '' });
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await service.submit(formData);
  } catch (err) {
    setError((err as Error).message);
  }
};
```

---
