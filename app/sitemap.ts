import type { MetadataRoute } from "next";
import { API_ENDPOINTS, Api } from "@/services/api/endpoints";

type SitemapItem = MetadataRoute.Sitemap[number];

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.shkelteaban.com").replace(
  /^http:\/\//,
  "https://"
);

const DEFAULT_CHANGE_FREQUENCY: SitemapItem["changeFrequency"] = "weekly";

const toAbsoluteUrl = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
};

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const extractArray = <T,>(result: any): T[] => {
  if (Array.isArray(result)) return result as T[];
  if (Array.isArray(result?.data)) return result.data as T[];
  if (Array.isArray(result?.data?.data)) return result.data.data as T[];
  if (Array.isArray(result?.data?.items)) return result.data.items as T[];
  if (Array.isArray(result?.data?.products)) return result.data.products as T[];
  if (Array.isArray(result?.products)) return result.products as T[];
  return [];
};

const fetchPaged = async <T,>(
  basePath: string,
  options: { limit?: number; maxPages?: number; query?: Record<string, string | number> } = {}
): Promise<T[]> => {
  const { limit = 100, maxPages = 20, query = {} } = options;
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

const slugify = (value: string) =>
  encodeURIComponent(
    value
      .toString()
      .trim()
      .replace(/\s+/g, "-")
  );

const buildEntry = (path: string, overrides: Partial<SitemapItem> = {}): SitemapItem => ({
  url: toAbsoluteUrl(path),
  lastModified: overrides.lastModified ?? new Date(),
  changeFrequency: overrides.changeFrequency ?? DEFAULT_CHANGE_FREQUENCY,
  priority: overrides.priority ?? 0.7,
});

const getStaticEntries = (): SitemapItem[] => [
  buildEntry("/", { changeFrequency: "daily", priority: 1 }),
  buildEntry("/products", { changeFrequency: "daily", priority: 0.9 }),
  buildEntry("/categories", { changeFrequency: "weekly", priority: 0.8 }),
  buildEntry("/about", { changeFrequency: "monthly", priority: 0.6 }),
  buildEntry("/about-marble", { changeFrequency: "monthly", priority: 0.6 }),
  buildEntry("/marble-info", { changeFrequency: "weekly", priority: 0.7 }),
  buildEntry("/policies", { changeFrequency: "yearly", priority: 0.4 }),
];

const getProductEntries = async (): Promise<SitemapItem[]> => {
  const products = await fetchPaged<{ _id?: string; id?: string; updatedAt?: string }>(
    API_ENDPOINTS.PRODUCTS.LIST,
    { limit: 100, maxPages: 30 }
  );

  return products
    .map((product) => product._id || product.id)
    .filter((id): id is string => Boolean(id))
    .map((id) =>
      buildEntry(`/product/${id}`, {
        changeFrequency: "weekly",
        priority: 0.8,
      })
    );
};

const getCategoryEntries = async (): Promise<SitemapItem[]> => {
  const result = await fetchJson<any>(`${Api}${API_ENDPOINTS.CATEGORIES.LIST}`);
  const categories = extractArray<{ _id?: string; id?: string; name?: string; updatedAt?: string }>(result);

  return categories
    .map((category) => category._id || category.id || category.name)
    .filter((value): value is string => Boolean(value))
    .map((value) =>
      buildEntry(`/categories/${slugify(value)}`, {
        changeFrequency: "weekly",
        priority: 0.7,
      })
    );
};

const getOrganizationEntries = async (): Promise<SitemapItem[]> => {
  const result = await fetchJson<any>(`${Api}/organizations`);
  const organizations = extractArray<{ organizationId?: string; id?: string; name?: string; updatedAt?: string }>(result);

  return organizations
    .map((org) => org.organizationId || org.id || org.name)
    .filter((value): value is string => Boolean(value))
    .map((value) =>
      buildEntry(`/organization/${slugify(value)}`, {
        changeFrequency: "weekly",
        priority: 0.7,
      })
    );
};

const getProfileEntries = async (): Promise<SitemapItem[]> => {
  const result = await fetchJson<any>(`${Api}/users/public`);
  const users = extractArray<{ username?: string; slug?: string; updatedAt?: string }>(result);

  return users
    .map((user) => user.slug || user.username)
    .filter((value): value is string => Boolean(value))
    .map((value) =>
      buildEntry(`/profile/${slugify(value)}`, {
        changeFrequency: "monthly",
        priority: 0.3,
      })
    );
};

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
  const [products, categories, organizations, profiles] = await Promise.all([
    getProductEntries(),
    getCategoryEntries(),
    getOrganizationEntries(),
    getProfileEntries(),
  ]);

  const entries = [
    ...getStaticEntries(),
    ...products,
    ...categories,
    ...organizations,
    ...profiles,
  ];

  return dedupeEntries(entries);
}
