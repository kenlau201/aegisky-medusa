'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

export default function ComparePageClient({ lang }: { lang: string }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const prefix = `/${params.lang}`;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
    if (ids.length === 0) { setLoading(false); return; }

    Promise.all(ids.map(id =>
      fetch(`/api/store/products/${id}`).then(r => r.json()).catch(() => null)
    )).then(results => {
      setProducts(results.filter(Boolean).map(r => r.product || r));
      setLoading(false);
    });
  }, [searchParams]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>;

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Compare Products</h1>
        <p className="text-gray-500 mb-6">No products selected for comparison.</p>
        <Link href={`${prefix}/products`} className="text-blue-600 hover:underline">Browse Products</Link>
      </div>
    );
  }

  const specs = [
    { key: 'name', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'price', label: 'Price' },
    { key: 'brand', label: 'Brand' },
    { key: 'in_stock', label: 'In Stock' },
    { key: 'rating', label: 'Rating' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Compare Products</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-4 border-b bg-gray-50 w-40">Specification</th>
              {products.map(p => (
                <th key={p.id} className="p-4 border-b">
                  <Link href={`${prefix}/product/${p.slug}`} className="text-blue-600 hover:underline">
                    {p.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {specs.map(spec => (
              <tr key={spec.key}>
                <td className="p-4 border-b font-medium text-gray-600">{spec.label}</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 border-b text-center">
                    {spec.key === 'price' ? `$${p[spec.key]}` :
                     spec.key === 'in_stock' ? (p[spec.key] ? 'Yes' : 'No') :
                     p[spec.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
