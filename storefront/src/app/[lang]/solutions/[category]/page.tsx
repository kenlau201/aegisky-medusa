'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SOLUTION_CATEGORIES, getCategoryById } from '@/lib/suppliers/solutions';

export default function SolutionCategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const category = getCategoryById(categoryId);

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    fetch(`/api/suppliers?category=${categoryId}&page=${page}&pageSize=24`)
      .then(r => r.json())
      .then(data => {
        setSuppliers(data.suppliers || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryId, page]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
          <p className="text-gray-600 mb-4">The technology category you're looking for doesn't exist.</p>
          <Link href="/zh/solutions" className="text-blue-600 hover:underline">← View All Categories</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/zh" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/zh/solutions" className="hover:text-blue-600">Solutions</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className={`w-16 h-16 ${category.bgColor} rounded-2xl flex items-center justify-center text-3xl flex-shrink-0`}>
              {category.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-gray-600 mt-2 max-w-2xl leading-relaxed">{category.longDescription}</p>
              <div className="flex items-center gap-4 mt-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${category.bgColor} ${category.color}`}>
                  {loading ? 'Loading...' : `${total} supplier${total !== 1 ? 's' : ''}`}
                </span>
                <Link
                  href="/zh/suppliers"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Browse all suppliers →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other categories quick nav */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {SOLUTION_CATEGORIES.filter(c => c.id !== categoryId).map(c => (
            <Link
              key={c.id}
              href={`/zh/solutions/${c.id}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all`}
            >
              <span>{c.icon}</span>
              {c.shortName}
            </Link>
          ))}
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No suppliers found in this category.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {suppliers.map(s => (
                <Link
                  key={s.id}
                  href={`/zh/supplier/${s.slug}`}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                    {s.logo_url ? (
                      <img src={s.logo_url} alt={s.name} className="max-w-full max-h-20 object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600">
                        {s.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{s.name}</h3>
                      {s.verified && (
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </div>
                    {s.tagline && <p className="text-xs text-gray-600 line-clamp-2 mb-2">{s.tagline}</p>}

                    {/* Other categories this supplier belongs to */}
                    {s.solution_categories && s.solution_categories.length > 1 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {s.solution_categories.filter((c: string) => c !== categoryId).slice(0, 2).map((catId: string) => {
                          const cat = SOLUTION_CATEGORIES.find(c => c.id === catId);
                          if (!cat) return null;
                          return (
                            <span key={catId} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${cat.bgColor} ${cat.color}`}>
                              {cat.icon} {cat.shortName}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {s.country && <span>{s.country}</span>}
                      <span>{s.product_count} products</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600 text-sm">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
