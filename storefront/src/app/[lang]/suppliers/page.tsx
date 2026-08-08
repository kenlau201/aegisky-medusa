'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

// 12个无人机系统解决方案分类（参考unmannedsystemstechnology.com）
const SOLUTION_CATEGORIES = [
  { id: 'counter-uas', name: 'Counter-UAS', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><circle cx="12" cy="12" r="6" strokeWidth="2"/><circle cx="12" cy="12" r="2" strokeWidth="2"/><line x1="12" y1="2" x2="12" y2="6" strokeWidth="2"/><line x1="12" y1="18" x2="12" y2="22" strokeWidth="2"/><line x1="2" y1="12" x2="6" y2="12" strokeWidth="2"/><line x1="18" y1="12" x2="22" y2="12" strokeWidth="2"/></svg>
  ), color: 'text-red-500' },
  { id: 'command-control', name: 'Command, Control & Communications', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>
  ), color: 'text-blue-500' },
  { id: 'electronics', name: 'Electronics & Subsystems', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2"/><rect x="9" y="9" width="6" height="6" strokeWidth="2"/><line x1="9" y1="2" x2="9" y2="4" strokeWidth="2"/><line x1="15" y1="2" x2="15" y2="4" strokeWidth="2"/><line x1="9" y1="20" x2="9" y2="22" strokeWidth="2"/><line x1="15" y1="20" x2="15" y2="22" strokeWidth="2"/><line x1="20" y1="9" x2="22" y2="9" strokeWidth="2"/><line x1="20" y1="14" x2="22" y2="14" strokeWidth="2"/><line x1="2" y1="9" x2="4" y2="9" strokeWidth="2"/><line x1="2" y1="14" x2="4" y2="14" strokeWidth="2"/></svg>
  ), color: 'text-purple-500' },
  { id: 'structural', name: 'Structural & Mechanical Systems', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" strokeWidth="2"/></svg>
  ), color: 'text-gray-600' },
  { id: 'positioning', name: 'Positioning, Navigation & Guidance', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><polygon points="12,2 14.5,9.5 22,12 14.5,14.5 12,22 9.5,14.5 2,12 9.5,9.5" strokeWidth="2"/></svg>
  ), color: 'text-indigo-500' },
  { id: 'sensors', name: 'Mission Sensors & Payloads', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="4" strokeWidth="2"/></svg>
  ), color: 'text-green-500' },
  { id: 'propulsion', name: 'Propulsion & Power', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" strokeWidth="2" strokeLinejoin="round"/></svg>
  ), color: 'text-yellow-500' },
  { id: 'materials', name: 'Materials & Manufacturing', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" strokeWidth="2"/><path strokeLinecap="round" strokeWidth={2} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  ), color: 'text-orange-500' },
  { id: 'safety', name: 'Safety Systems', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
  ), color: 'text-green-600' },
  { id: 'services', name: 'Professional Services', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" strokeWidth="2"/><path strokeLinecap="round" strokeWidth={2} d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
  ), color: 'text-teal-500' },
  { id: 'software', name: 'Software & Autonomy', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2"/><line x1="8" y1="21" x2="16" y2="21" strokeWidth="2"/><line x1="12" y1="17" x2="12" y2="21" strokeWidth="2"/></svg>
  ), color: 'text-cyan-500' },
  { id: 'vehicles', name: 'Unmanned Vehicles & Platforms', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3" strokeWidth="2"/><circle cx="18" cy="6" r="3" strokeWidth="2"/><circle cx="6" cy="18" r="3" strokeWidth="2"/><circle cx="18" cy="18" r="3" strokeWidth="2"/><line x1="9" y1="6" x2="15" y2="6" strokeWidth="2"/><line x1="9" y1="18" x2="15" y2="18" strokeWidth="2"/><line x1="6" y1="9" x2="6" y2="15" strokeWidth="2"/><line x1="18" y1="9" x2="18" y2="15" strokeWidth="2"/><rect x="9" y="9" width="6" height="6" rx="1" strokeWidth="2"/></svg>
  ), color: 'text-blue-600' },
];

function SuppliersContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = params.lang as string;

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState(SOLUTION_CATEGORIES);

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
        if (data.categories) {
          setCategories(SOLUTION_CATEGORIES.map(c => ({
            ...c,
            count: data.categories.find((dc: any) => dc.id === c.id)?.count || 0
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, selectedCategory, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const url = new URL(window.location.href);
    if (search) url.searchParams.set('q', search); else url.searchParams.delete('q');
    if (selectedCategory) url.searchParams.set('category', selectedCategory); else url.searchParams.delete('category');
    router.push(url.pathname + url.search);
  };

  const selectCategory = (catId: string) => {
    setSelectedCategory(selectedCategory === catId ? '' : catId);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find a Supplier</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Explore capabilities of unmanned system, subsystem, component and service suppliers for the global UAV industry
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border border-gray-200 rounded-xl overflow-hidden bg-white">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              className={`flex items-center gap-3 p-6 text-left transition-all hover:bg-gray-50 border-gray-200 ${
                selectedCategory === cat.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              } ${i < 8 ? 'border-b' : ''} ${i % 4 !== 3 ? 'border-r' : ''}`}
            >
              <div className={`${cat.color} flex-shrink-0`}>{cat.icon}</div>
              <div>
                <div className="font-medium text-gray-900 text-sm leading-tight">{cat.name}</div>
                {cat.count > 0 && (
                  <div className="text-xs text-gray-500 mt-1">{cat.count} suppliers</div>
                )}
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          For Suppliers: <Link href="#" className="text-blue-600 hover:underline">Partner with us to showcase your solutions »</Link>
        </p>
      </div>

      {/* Suppliers Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {selectedCategory && (
          <div className="mb-6 flex items-center gap-3">
            <span className="text-gray-600">Filter:</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              {SOLUTION_CATEGORIES.find(c => c.id === selectedCategory)?.name}
              <button onClick={() => setSelectedCategory('')} className="hover:text-blue-600">×</button>
            </span>
            <span className="text-gray-500 text-sm">({total} suppliers found)</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4">Loading suppliers...</p>
          </div>
        ) : suppliers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {suppliers.map(s => (
                <Link
                  key={s.id}
                  href={`/${lang}/suppliers/${s.slug}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                >
                  {/* Logo area */}
                  <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 relative overflow-hidden">
                    {s.logo_url ? (
                      <img src={s.logo_url} alt={s.name} className="max-w-full max-h-24 object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                        {s.name?.charAt(0)}
                      </div>
                    )}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                    </button>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">{s.name}</h3>
                    {s.tagline && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{s.tagline}</p>
                    )}
                    {s.description && !s.tagline && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{s.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      {s.country && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth={2}/></svg>
                          {s.country}
                        </span>
                      )}
                      {s.product_count > 0 && (
                        <span>• {s.product_count} products</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                        View Profile
                      </button>
                      {s.website_url && (
                        <a
                          href={s.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Visit
                        </a>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-2">No suppliers found</div>
            <p className="text-gray-500 text-sm">Try adjusting your search or filter</p>
          </div>
        )}
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
