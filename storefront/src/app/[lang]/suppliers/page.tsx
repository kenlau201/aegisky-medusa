'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { SOLUTION_CATEGORIES } from '@/lib/suppliers/solutions';

function SuppliersContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = params.lang as string;

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [featuredSuppliers, setFeaturedSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({ brands: 0, products: 0, countries: 0 });

  useEffect(() => {
    // Fetch featured suppliers (top by product count)
    fetch('/api/suppliers?page=1&pageSize=24')
      .then(r => r.json())
      .then(data => {
        setFeaturedSuppliers(data.suppliers || []);
        const counts: Record<string, number> = {};
        (data.categories || []).forEach((c: any) => { counts[c.id] = c.count; });
        setCategoryCounts(counts);
        setStats({
          brands: data.total || 0,
          products: 6343,
          countries: 50,
        });
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    params.set('page', page.toString());
    params.set('pageSize', '12');

    fetch(`/api/suppliers?${params}`)
      .then(r => r.json())
      .then(data => {
        setSuppliers(data.suppliers || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        const counts: Record<string, number> = {};
        (data.categories || []).forEach((c: any) => { counts[c.id] = c.count; });
        setCategoryCounts(counts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, selectedCategory, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const selectCategory = (catId: string) => {
    setSelectedCategory(selectedCategory === catId ? '' : catId);
    setPage(1);
  };

  // Tier badge
  const getTierBadge = (index: number) => {
    if (index < 6) return { label: 'Platinum', class: 'bg-gradient-to-r from-gray-700 to-gray-900 text-white' };
    if (index < 14) return { label: 'Gold', class: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white' };
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Find a Supplier</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Explore capabilities of unmanned system, subsystem, component and service suppliers for the global UAV industry
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full pl-14 pr-6 py-4 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Technology Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {SOLUTION_CATEGORIES.map(cat => {
            const count = categoryCounts[cat.id] || 0;
            return (
              <Link
                key={cat.id}
                href={`/${lang}/solutions/${cat.id}`}
                className="flex items-start gap-3 p-5 text-left rounded-xl border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 ${cat.bgColor} rounded-lg flex items-center justify-center text-xl flex-shrink-0`}>
                  {cat.icon}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-blue-600">{cat.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{count} suppliers</div>
                </div>
                <svg className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured Suppliers */}
      {!selectedCategory && !search && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Suppliers</h2>
            <Link href={`/${lang}/suppliers?all=1`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all suppliers →
            </Link>
          </div>

          {featuredSuppliers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featuredSuppliers.map((s, idx) => {
                const tier = getTierBadge(idx);
                return (
                  <div
                    key={s.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
                  >
                    {/* Product image area */}
                    <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                      {s.logo_url ? (
                        <img src={s.logo_url} alt={s.name} className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                            {s.name?.charAt(0)}
                          </div>
                        </div>
                      )}
                      {tier && (
                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${tier.class} shadow-sm`}>
                          {tier.label}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-base truncate">{s.name}</h3>
                        <span className="flex-shrink-0 text-green-600" title="Verified">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                        </span>
                      </div>

                      {s.tagline && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3 min-h-[32px]">{s.tagline}</p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                          {s.product_count} products
                        </span>
                        {s.country && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth={2}/></svg>
                            {s.country}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/${lang}/supplier/${s.slug}`}
                          className="flex-1 text-center bg-gray-900 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
                        >
                          View Profile
                        </Link>
                        <Link
                          href={`/${lang}/supplier/${s.slug}?tab=products`}
                          className="flex-1 text-center border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                        >
                          Products
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">Loading suppliers...</div>
          )}
        </div>
      )}

      {/* Filtered Results */}
      {(selectedCategory || search) && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          {selectedCategory && (
            <div className="mb-6 flex items-center gap-3">
              <span className="text-gray-600">Filter:</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                {SOLUTION_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory('')} className="hover:text-blue-600 font-bold">×</button>
              </span>
              <span className="text-gray-500 text-sm">({total} suppliers found)</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : suppliers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {suppliers.map(s => (
                  <Link
                    key={s.id}
                    href={`/${lang}/supplier/${s.slug}`}
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
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{s.name}</h3>
                      {s.tagline && <p className="text-xs text-gray-600 line-clamp-2 mb-2">{s.tagline}</p>}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {s.country && <span>{s.country}</span>}
                        <span>{s.product_count} products</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm">Previous</button>
                  <span className="px-4 py-2 text-gray-600 text-sm">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm">Next</button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-gray-500">No suppliers found. Try adjusting your search.</div>
          )}
        </div>
      )}

      {/* Stats Footer */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400">{stats.brands}+</div>
              <div className="text-gray-400 mt-1 text-sm">Verified Suppliers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400">{stats.products.toLocaleString()}</div>
              <div className="text-gray-400 mt-1 text-sm">Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400">{SOLUTION_CATEGORIES.length}</div>
              <div className="text-gray-400 mt-1 text-sm">Solution Categories</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">{stats.countries}+</div>
              <div className="text-gray-400 mt-1 text-sm">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400">Loading...</div>}>
      <SuppliersContent />
    </Suspense>
  );
}
