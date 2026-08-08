'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { SOLUTION_CATEGORIES } from '@/lib/suppliers/solutions';

function SuppliersContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params.lang as string;

  const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({ brands: 0, products: 0, countries: 0 });

  // Initial load: category counts + stats from first page
  useEffect(() => {
    fetch('/api/suppliers?page=1&pageSize=24')
      .then(r => r.json())
      .then(data => {
        const counts: Record<string, number> = {};
        (data.categories || []).forEach((c: any) => { counts[c.id] = c.count; });
        setCategoryCounts(counts);
        setStats({
          brands: data.stats?.verifiedBrands || data.total || 0,
          products: data.stats?.products || 0,
          countries: data.stats?.countries || 0,
        });
      });
  }, []);

  // Paginated supplier fetch (with search)
  useEffect(() => {
    setLoading(true);
    const urlParams = new URLSearchParams();
    if (search) urlParams.set('search', search);
    urlParams.set('page', page.toString());
    urlParams.set('pageSize', '24');

    fetch(`/api/suppliers?${urlParams}`)
      .then(r => r.json())
      .then(data => {
        setAllSuppliers(data.suppliers || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // Featured = first 8 suppliers (verified, top by product count)
  const featuredSuppliers = allSuppliers.slice(0, 8);

  const getTierBadge = (index: number) => {
    if (index < 6) return { label: 'Platinum', class: 'bg-gradient-to-r from-gray-700 to-gray-900 text-white' };
    if (index < 14) return { label: 'Gold', class: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white' };
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Find a Supplier</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Explore {stats.brands || 439}+ verified suppliers across the complete UAV technology stack —
            from propulsion and sensors to complete air vehicles, software, and professional services.
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
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search suppliers by name, product, or capability..."
                className="w-full pl-14 pr-6 py-4 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
              />
            </div>
          </form>

          {search && (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
              <span>Searching for "{search}"</span>
              <button onClick={() => setSearch('')} className="hover:text-blue-900 font-bold ml-1">×</button>
              <span className="text-blue-500">· {total} results</span>
            </div>
          )}
        </div>
      </section>

      {/* Browse by Technology Category */}
      <section className="max-w-7xl mx-auto px-4 py-12" aria-labelledby="categories-heading">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="categories-heading" className="text-2xl font-bold text-gray-900">Browse by Technology Category</h2>
            <p className="text-sm text-gray-500 mt-1">
              Suppliers classified by their core technology domain. Click any category to explore specialized suppliers.
            </p>
          </div>
          <Link
            href={`/${lang}/solutions`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            View all categories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        <nav aria-label="Technology categories" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SOLUTION_CATEGORIES.map(cat => {
            const count = categoryCounts[cat.id] || 0;
            return (
              <Link
                key={cat.id}
                href={`/${lang}/solutions/${cat.id}`}
                className="group flex items-start gap-3 p-5 text-left rounded-xl border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className={`w-11 h-11 ${cat.bgColor} rounded-lg flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm leading-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`text-xs font-medium ${cat.color}`}>{count} suppliers</span>
                    <svg className="w-3 h-3 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </section>

      {/* Featured Suppliers */}
      {!search && (
        <section className="max-w-7xl mx-auto px-4 pb-12" aria-labelledby="featured-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="featured-heading" className="text-2xl font-bold text-gray-900">Featured Suppliers</h2>
            <span className="text-sm text-gray-500">Top verified manufacturers and brands</span>
          </div>

          {featuredSuppliers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featuredSuppliers.map((s, idx) => {
                const tier = getTierBadge(idx);
                return (
                  <article
                    key={s.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
                  >
                    <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                      {s.logo_url ? (
                        <img src={s.logo_url} alt={`${s.name} logo`} className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform" />
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
                        {s.verified && (
                          <span className="flex-shrink-0 text-green-600" title="Verified Supplier">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                          </span>
                        )}
                      </div>

                      {s.tagline && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2 min-h-[32px]">{s.tagline}</p>
                      )}

                      {/* Technology category tags */}
                      {s.solution_categories && s.solution_categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {s.solution_categories.slice(0, 3).map((catId: string) => {
                            const cat = SOLUTION_CATEGORIES.find(c => c.id === catId);
                            if (!cat) return null;
                            return (
                              <Link
                                key={catId}
                                href={`/${lang}/solutions/${catId}`}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${cat.bgColor} ${cat.color} hover:opacity-80 transition-opacity`}
                              >
                                <span className="text-xs">{cat.icon}</span>
                                {cat.shortName}
                              </Link>
                            );
                          })}
                          {s.solution_categories.length > 3 && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-500"
                              title={s.solution_categories.slice(3).map((id: string) => SOLUTION_CATEGORIES.find(c => c.id === id)?.shortName).filter(Boolean).join(', ')}
                            >
                              +{s.solution_categories.length - 3}
                            </span>
                          )}
                        </div>
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
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">Loading suppliers...</div>
          )}
        </section>
      )}

      {/* All Suppliers (or search results) */}
      <section className="bg-gray-50 border-t" aria-labelledby="all-suppliers-heading">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 id="all-suppliers-heading" className="text-2xl font-bold text-gray-900">
              {search ? `Search Results` : 'All Suppliers'}
            </h2>
            <span className="text-sm text-gray-500">
              {search ? `${total} suppliers matching "${search}"` : `${total} verified suppliers`}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : allSuppliers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {allSuppliers.map(s => (
                  <Link
                    key={s.id}
                    href={`/${lang}/supplier/${s.slug}`}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
                  >
                    <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                      {s.logo_url ? (
                        <img src={s.logo_url} alt={`${s.name} logo`} className="max-w-full max-h-20 object-contain group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600">
                          {s.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{s.name}</h3>
                        {s.verified && (
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" title="Verified Supplier">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </div>
                      {s.tagline && <p className="text-xs text-gray-600 line-clamp-2 mb-2">{s.tagline}</p>}

                      {s.solution_categories && s.solution_categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {s.solution_categories.slice(0, 2).map((catId: string) => {
                            const cat = SOLUTION_CATEGORIES.find(c => c.id === catId);
                            if (!cat) return null;
                            return (
                              <span key={catId} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${cat.bgColor} ${cat.color}`}>
                                <span className="text-xs">{cat.icon}</span>
                                {cat.shortName}
                              </span>
                            );
                          })}
                          {s.solution_categories.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-500">
                              +{s.solution_categories.length - 2}
                            </span>
                          )}
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

              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-2 mt-10" aria-label="Pagination">
                  <button
                    onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600 text-sm">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-2">No suppliers found</p>
              <p className="text-sm">Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Footer */}
      <section className="bg-gray-900 text-white" aria-label="Platform statistics">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400">{stats.brands || 439}+</div>
              <div className="text-gray-400 mt-1 text-sm">Verified Suppliers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400">{(stats.products || 6385).toLocaleString()}</div>
              <div className="text-gray-400 mt-1 text-sm">Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400">{SOLUTION_CATEGORIES.length}</div>
              <div className="text-gray-400 mt-1 text-sm">Technology Domains</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">{stats.countries || 30}+</div>
              <div className="text-gray-400 mt-1 text-sm">Countries</div>
            </div>
          </div>
        </div>
      </section>
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
