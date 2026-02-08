// Pages/HomePage/sections/OurProductSection/ProductSection.tsx
"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { productService } from '@/services/api/products';

const imageBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3002/app/v1'
).replace(/\/app\/v1\/?$/, '');

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeProductImage = (src?: string) => {
    if (!src) return '/acessts/NoImage.jpg';
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    if (src.startsWith('/')) return src;
    return `${imageBaseUrl}/${src.replace(/^\//, '')}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await productService.getProducts({ limit: 12 });
        setProducts(productsData.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="bg-white backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="text-center py-8 text-slate-600">جاري تحميل المنتجات...</div>
      </section>
    );
  }

  return (
    <section className="bg-white backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h2 className="text-right text-lg sm:text-xl font-bold text-blue-900 mb-3">منتجاتنا</h2>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <Image
                src={normalizeProductImage(product.image)}
                alt={product.name || "صورة المنتج"}
                width={420}
                height={240}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                className="w-full h-48 object-cover rounded-lg"
              />
              <h3 className="text-slate-900">{product.name}</h3>
              <p className="text-primary font-bold">{product.price} ج.م</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-600">
          لا توجد منتجات متاحة حاليًا. <br />
          جاري التحميل...
        </div>
      )}
    </section>
  );
}