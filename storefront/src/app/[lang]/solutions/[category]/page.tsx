'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SOLUTION_CATEGORIES, getCategoryById } from '@/lib/suppliers/solutions';

export default function SolutionCategoryPage() {
  const params = useParams();
  const lang = params.lang as string;
  const categoryId = params.category as string;

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'suppliers' | 'products'>('suppliers');
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const category = getCategoryById(categoryId) || {
    id: categoryId,
    name: categoryId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    shortName: categoryId.replace(/-/g, ' '),
    icon: '📦',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'Browse suppliers and products in this category.',
    longDescription: '',
  };

  const relatedCategories = SOLUTION_CATEGORIES.filter(c => c.id !== categoryId).slice(0, 6);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/suppliers?category=${categoryId}&page=1&pageSize=24`)
      .then(r => r.json())
      .then(data => {
        setSuppliers(data.suppliers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch related products
    const keywords: Record<string, string> = {
      'counter-uas': 'counter anti-drone jammer detection',
      'command-control': 'controller transmitter receiver telemetry radio antenna',
      'electronics': 'electronic circuit board module esc bec',
      'structural': 'frame landing gear mount bracket servo',
      'positioning': 'gps gnss compass imu navigation rtk',
      'sensors': 'camera sensor lidar thermal gimbal payload',
      'propulsion': 'motor propeller battery lipo engine',
      'materials': 'carbon fiber material composite 3d print cnc',
      'safety': 'parachute failsafe safety recovery',
      'services': 'service training consulting maintenance repair',
      'software': 'software autopilot px4 ardupilot flight controller',
      'vehicles': 'drone uav quadcopter multirotor fixed-wing vtol',
    };
    const kw = keywords[categoryId] || categoryId;
    fetch(`/api/products?search=${encodeURIComponent(kw)}&page=1&pageSize=8`)
      .then(r => r.json())
      .then(data => setRelatedProducts(data.products || []))
      .catch(() => {});
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href={`/${lang}`} className="hover:text-blue-600">
              <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </Link>
            <span>/</span>
            <Link href={`/${lang}/suppliers`} className="hover:text-blue-600">Suppliers</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Card */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-14 h-14 ${category.bgColor} rounded-xl flex items-center justify-center text-3xl`}>
                    {category.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-600 tracking-wider uppercase">Leading Global Suppliers</div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{category.name}</h1>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{category.longDescription || category.description}</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('suppliers')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'suppliers' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    View {suppliers.length} Suppliers
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      activeTab === 'products' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    View Products
                  </button>
                </div>
              </div>
              {/* Sponsor placeholder */}
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 text-center h-full flex flex-col items-center justify-center min-h-[140px]">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Sponsor</div>
                  <div className="text-sm text-gray-400 mt-1">Advertise here</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Suppliers/Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeTab === 'suppliers' ? 'Suppliers' : 'Products'}
                </h2>
                <p className="text-sm text-gray-500">
                  {activeTab === 'suppliers'
                    ? `${suppliers.length} supplier${suppliers.length !== 1 ? 's' : ''} in this category`
                    : `${relatedProducts.length} product${relatedProducts.length !== 1 ? 's' : ''} found`
                  }
                </p>
              </div>
              {activeTab === 'suppliers' && (
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Grid view"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" strokeWidth="2"/></svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    title="List view"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6" strokeWidth="2"/><line x1="3" y1="12" x2="21" y2="12" strokeWidth="2"/><line x1="3" y1="18" x2="21" y2="18" strokeWidth="2"/></svg>
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activeTab === 'suppliers' ? (
              suppliers.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {suppliers.map(s => (
                      <Link
                        key={s.id}
                        href={`/${lang}/supplier/${s.slug}`}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                      >
                        <div className="h-28 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5">
                          {s.logo_url ? (
                            <img src={s.logo_url} alt={s.name} className="max-w-full max-h-16 object-contain group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600">{s.name?.charAt(0)}</div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">{s.name}</h3>
                            <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                          </div>
                          {s.tagline && <p className="text-xs text-gray-600 line-clamp-2 mb-2">{s.tagline}</p>}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            {s.country && <span>{s.country}</span>}
                            <span>{s.product_count} products</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suppliers.map(s => (
                      <Link
                        key={s.id}
                        href={`/${lang}/supplier/${s.slug}`}
                        className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group"
                      >
                        <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          {s.logo_url ? (
                            <img src={s.logo_url} alt={s.name} className="max-w-full max-h-12 object-contain" />
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600">{s.name?.charAt(0)}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{s.name}</h3>
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                          </div>
                          {s.tagline && <p className="text-sm text-gray-600 line-clamp-1 mt-0.5">{s.tagline}</p>}
                        </div>
                        <div className="text-right text-sm flex-shrink-0">
                          <div className="font-medium text-gray-900">{s.product_count} products</div>
                          {s.country && <div className="text-xs text-gray-500">{s.country}</div>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <p className="text-gray-500">No suppliers found in this category.</p>
                </div>
              )
            ) : (
              relatedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {relatedProducts.map((p: any) => (
                    <Link key={p.id} href={`/${lang}/products/${p.slug || p.id}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
                      <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                        {p.main_image ? (
                          <img src={p.main_image} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{p.name}</h4>
                        {p.price && <div className="text-sm font-bold text-blue-600 mt-1">${p.price}</div>}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <p className="text-gray-500">No products found.</p>
                </div>
              )
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Related Categories</h3>
              <div className="space-y-2">
                {relatedCategories.map(rc => (
                  <Link
                    key={rc.id}
                    href={`/${lang}/solutions/${rc.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-8 h-8 ${rc.bgColor} rounded-lg flex items-center justify-center text-base flex-shrink-0`}>
                      {rc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors truncate">{rc.shortName}</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                  </Link>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link
                  href={`/${lang}/suppliers`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                  Browse All Suppliers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
