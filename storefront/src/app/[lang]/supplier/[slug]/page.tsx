'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SOLUTION_CATEGORIES } from '@/lib/suppliers/solutions';

function SupplierContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params.lang as string;
  const slug = params.slug as string;

  const [supplier, setSupplier] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [relatedSuppliers, setRelatedSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/suppliers/${slug}`)
      .then(r => r.json())
      .then(data => {
        setSupplier(data.brand || data.supplier || data);
        setProducts(data.products || []);
        setRelatedSuppliers(data.relatedBrands || data.relatedSuppliers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Supplier Not Found</h1>
          <p className="text-gray-600 mb-4">The supplier you're looking for doesn't exist.</p>
          <Link href={`/${lang}/suppliers`} className="text-blue-600 hover:underline">← Back to Suppliers</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'CAPABILITY OVERVIEW' },
    { id: 'products', label: 'PRODUCTS' },
    { id: 'documents', label: 'DOCUMENTS' },
    { id: 'contact', label: 'CONTACT' },
  ];

  // Generate description based on categories
  const categories = supplier.solution_categories || [];
  const categoryNames = categories.map((c: string) => SOLUTION_CATEGORIES.find(sc => sc.id === c)?.shortName).filter(Boolean);

  const generatedDescription = supplier.description || (
    categoryNames.length > 0
      ? `${supplier.name} is a verified supplier specializing in ${categoryNames.join(', ')} for the unmanned systems industry. With ${supplier.product_count || 0} products in their catalog, they serve customers globally with quality UAV components and solutions.`
      : `${supplier.name} is a verified supplier on the Aegisky Global UAV Trusted Trade Network, offering ${supplier.product_count || 0} products for the unmanned systems industry.`
  );

  // First product as banner
  const bannerProduct = products[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href={`/${lang}`} className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href={`/${lang}/suppliers`} className="hover:text-blue-600">Suppliers</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{supplier.name}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{supplier.name}</h1>
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Verified
              </span>
            </div>

            {supplier.tagline && (
              <p className="text-lg text-gray-600 mb-4">{supplier.tagline}</p>
            )}

            <p className="text-gray-700 leading-relaxed mb-6 max-w-3xl">{generatedDescription}</p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                onClick={() => setActiveTab('products')}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                View Products
              </button>
              <button
                onClick={() => setSaved(!saved)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium border transition-colors ${
                  saved ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                {saved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Contact
              </button>

              {/* Social Links */}
              <div className="flex items-center gap-2 ml-2">
                <a href="#" className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors" title="LinkedIn">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors" title="YouTube">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              {supplier.country && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth={2}/></svg>
                  {supplier.country}
                </div>
              )}
              {supplier.founded_year && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  Founded {supplier.founded_year}
                </div>
              )}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                {supplier.product_count || products.length} products
              </div>
            </div>
          </div>

          {/* Right: Logo */}
          <div className="w-full md:w-56 flex-shrink-0">
            <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-center border border-gray-200 min-h-[160px]">
              {supplier.logo_url ? (
                <img src={supplier.logo_url} alt={supplier.name} className="max-w-full max-h-28 object-contain" />
              ) : (
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                  {supplier.name?.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 text-sm font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'overview' && (
              <div>
                {/* Jump to Section */}
                <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Jump to Section</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <a href="#about" className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      About
                    </a>
                    <a href="#capabilities" className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                      Capabilities
                    </a>
                    <a href="#products-section" className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                      Products
                    </a>
                  </div>
                </div>

                <div id="about" className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About {supplier.name}</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">{generatedDescription}</p>
                    {supplier.description && supplier.description !== generatedDescription && (
                      <p className="text-gray-700 leading-relaxed mt-4">{supplier.description}</p>
                    )}
                  </div>
                </div>

                {categories.length > 0 && (
                  <div id="capabilities" className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Capabilities</h2>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c: string) => {
                        const cat = SOLUTION_CATEGORIES.find(sc => sc.id === c);
                        return cat ? (
                          <Link
                            key={c}
                            href={`/${lang}/solutions/${c}`}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${cat.bgColor} ${cat.color} hover:opacity-80 transition-opacity`}
                          >
                            <span>{cat.icon}</span>
                            {cat.shortName}
                          </Link>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Products Preview */}
                <div id="products-section">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Products</h2>
                    {products.length > 12 && (
                      <button onClick={() => setActiveTab('products')} className="text-sm text-blue-600 hover:underline font-medium">
                        View all {products.length} products →
                      </button>
                    )}
                  </div>
                  {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {products.slice(0, 12).map((p: any) => (
                        <Link key={p.id} href={`/${lang}/products/${p.slug || p.id}`} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
                          <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                            {p.main_image ? (
                              <img src={p.main_image} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
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
                    <p className="text-gray-500 text-sm">No products available yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">All Products ({products.length})</h2>
                {products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((p: any) => (
                      <Link key={p.id} href={`/${lang}/products/${p.slug || p.id}`} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
                        <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                          {p.main_image ? (
                            <img src={p.main_image} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
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
                  <p className="text-gray-500">No products available.</p>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Documents & Resources</h2>
                <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  <p className="text-gray-500">Documents will be available once the supplier uploads them.</p>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact {supplier.name}</h2>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 max-w-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="your@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="I'm interested in your products..."></textarea>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            {/* Product Banner */}
            {bannerProduct && (
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-5 border border-gray-200">
                <div className="aspect-video flex items-center justify-center p-6">
                  {bannerProduct.main_image ? (
                    <img src={bannerProduct.main_image} alt={bannerProduct.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-4xl">📦</div>
                  )}
                </div>
                <div className="bg-white p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Featured Product</div>
                  <div className="font-medium text-gray-900 text-sm line-clamp-2">{bannerProduct.name}</div>
                  {bannerProduct.price && <div className="text-blue-600 font-bold mt-1">${bannerProduct.price}</div>}
                </div>
              </div>
            )}

            {/* Company Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {supplier.logo_url ? (
                    <img src={supplier.logo_url} alt={supplier.name} className="max-w-full max-h-8 object-contain" />
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">{supplier.name?.charAt(0)}</div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{supplier.name}</div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    Verified Supplier
                  </div>
                </div>
              </div>

              {supplier.tagline && (
                <p className="text-sm text-gray-600 mb-4">{supplier.tagline}</p>
              )}

              <div className="space-y-3 mb-5">
                {supplier.country && (
                  <div className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth={2}/></svg>
                    <span className="text-gray-700">{supplier.country}</span>
                  </div>
                )}
                {supplier.website_url && (
                  <div className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                    <a href={supplier.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{supplier.website_url}</a>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                  <span className="text-gray-700">{supplier.product_count || products.length} products</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('products')}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  View Products
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Contact Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupplierDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <SupplierContent />
    </Suspense>
  );
}
