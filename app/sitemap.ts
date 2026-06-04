import type { MetadataRoute } from "next";
import { API_ENDPOINTS, Api } from "@/services/api/endpoints";
import { marbleUseCategories } from "@/app/marble-uses/data";

type SitemapItem = MetadataRoute.Sitemap[number];

type ApiEntity = {
  _id?: string;
  id?: string;
  slug?: string;
  name?: string;
  username?: string;
  organizationId?: string;
  updatedAt?: string;
};

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "https://shakeltabaanfrontend-no-vercel.vercel.app").replace(
  /^http:\/\//,
  "https://"
);

// Ensure absolute HTTPS URLs for the sitemap.
const toAbsoluteUrl = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
};

const toLastModified = (value?: string) => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
};

const slugify = (value: string) =>
  encodeURIComponent(
    value
      .toString()
      .trim()
      .replace(/\s+/g, "-")
  );

// Typed fetch helper with revalidation to keep sitemap fresh but safe for builds.
const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

// Normalize various API response shapes into a flat array.
const extractArray = <T,>(result: any): T[] => {
  if (Array.isArray(result)) return result as T[];
  if (Array.isArray(result?.data)) return result.data as T[];
  if (Array.isArray(result?.data?.data)) return result.data.data as T[];
  if (Array.isArray(result?.data?.items)) return result.data.items as T[];
  if (Array.isArray(result?.data?.products)) return result.data.products as T[];
  if (Array.isArray(result?.products)) return result.products as T[];
  return [];
};

// Paged fetch for large collections to avoid missing entries.
const fetchPaged = async <T,>(
  basePath: string,
  options: { limit?: number; maxPages?: number; query?: Record<string, string | number> } = {}
): Promise<T[]> => {
  const { limit = 100, maxPages = 30, query = {} } = options;
  const items: T[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...Object.fromEntries(Object.entries(query).map(([key, value]) => [key, String(value)])),
    });
    const url = `${Api}${basePath}?${params.toString()}`;
    const result = await fetchJson<any>(url);
    const pageItems = extractArray<T>(result);
    if (!pageItems.length) break;
    items.push(...pageItems);
    if (pageItems.length < limit) break;
  }

  return items;
};

// Base entry builder with overrides for SEO priority and change frequency.
const buildEntry = (path: string, overrides: Partial<SitemapItem> = {}): SitemapItem => ({
  url: toAbsoluteUrl(path),
  lastModified: overrides.lastModified ?? new Date(),
  changeFrequency: overrides.changeFrequency ?? "weekly",
  priority: overrides.priority ?? 0.7,
});

// Static route entries with explicit SEO priorities.
const getStaticEntries = (): SitemapItem[] => [
  buildEntry("/", { changeFrequency: "daily", priority: 1.0 }),
  buildEntry("/products", { changeFrequency: "daily", priority: 0.95 }),
  buildEntry("/marble-info", { changeFrequency: "weekly", priority: 0.9 }),
  buildEntry("/about", { changeFrequency: "monthly", priority: 0.6 }),
  buildEntry("/about-marble", { changeFrequency: "monthly", priority: 0.6 }),
  buildEntry("/policies", { changeFrequency: "yearly", priority: 0.4 }),
];

// Marble use pages are local data; still included as absolute URLs.
const getMarbleUseEntries = (): SitemapItem[] =>
  marbleUseCategories.map((item) =>
    buildEntry(`/marble-uses/${encodeURIComponent(item.slug)}`, {
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

const getProductEntries = async (): Promise<SitemapItem[]> => {
  const products = await fetchPaged<ApiEntity>(API_ENDPOINTS.PRODUCTS.LIST, {
    limit: 100,
    maxPages: 30,
  });

  const hasProductId = (product: ApiEntity): product is ApiEntity & { _id?: string; id: string } =>
    typeof (product._id || product.id) === "string";

  return products
    .filter(hasProductId)
    .map((product) => ({
      id: product._id || product.id,
      updatedAt: product.updatedAt ?? undefined,
    }))
    .map((entry) =>
      buildEntry(`/product/${encodeURIComponent(entry.id)}`, {
        changeFrequency: "weekly",
        priority: 0.75,
        lastModified: toLastModified(entry.updatedAt),
      })
    );
};


const getOrganizationEntries = async (): Promise<SitemapItem[]> => {
  const result = await fetchJson<any>(`${Api}/organizations`);
  const organizations = extractArray<ApiEntity>(result);

  const hasOrganizationValue = (org: ApiEntity): org is ApiEntity & { name: string } =>
    typeof (org.organizationId || org.id || org.name) === "string";

  return organizations
    .filter(hasOrganizationValue)
    .map((org) =>
      buildEntry(`/organization/${slugify(org.organizationId || org.id || org.name)}`, {
        changeFrequency: "weekly",
        priority: 0.6,
        lastModified: toLastModified(org.updatedAt),
      })
    );
};

const getProfileEntries = async (): Promise<SitemapItem[]> => {
  const result = await fetchJson<any>(`${Api}/users/public`);
  const users = extractArray<ApiEntity>(result);

  const hasProfileValue = (user: ApiEntity): user is ApiEntity & { username: string } =>
    typeof (user.slug || user.username) === "string";

  return users
    .filter(hasProfileValue)
    .map((user) =>
      buildEntry(`/profile/${slugify(user.slug || user.username)}`, {
        changeFrequency: "monthly",
        priority: 0.3,
        lastModified: toLastModified(user.updatedAt),
      })
    );
};

// Dedupe URLs to avoid duplicate entries in the sitemap.
const dedupeEntries = (entries: SitemapItem[]): SitemapItem[] => {
  const map = new Map<string, SitemapItem>();
  entries.forEach((entry) => {
    if (!map.has(entry.url)) {
      map.set(entry.url, entry);
    }
  });
  return Array.from(map.values());
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, organizations, profiles] = await Promise.all([
    getProductEntries(),
    getOrganizationEntries(),
    getProfileEntries(),
  ]);

  const entries = [
    ...getStaticEntries(),
    ...getMarbleUseEntries(),
    ...products,
    ...organizations,
    ...profiles,
  ];

  return dedupeEntries(entries);
}
