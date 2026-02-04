// Pages/HomePage/sections/OurProductSection/ProductSection.tsx
"use client";
import { useEffect, useState } from 'react';
import { productService } from '@/services/api/products';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
              <img src={product.image || '/acessts/NoImage.jpg'} alt={product.name} className="w-full h-48 object-cover rounded-lg" />
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