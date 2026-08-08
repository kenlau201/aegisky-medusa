'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const TABS = [
  { id: 'overview', label: 'CAPABILITY OVERVIEW' },
  { id: 'products', label: 'PRODUCTS' },
  { id: 'solutions', label: 'SOLUTIONS' },
  { id: 'documents', label: 'DOCUMENTS' },
  { id: 'contact', label: 'CONTACT' },
];

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const slug = params.slug as string;

  const [brand, setBrand] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [relatedBrands, setRelatedBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/suppliers/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.push(`/${lang}/suppliers`); return; }
        setBrand(data.brand);
        setProducts(data.products || []);
        setRelatedBrands(data.relatedBrands || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, router, lang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading supplier profile...</p>
        </div>
      </div>
    );
  }

  if (!brand) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href={`/${lang}`} className="hover:text-blue-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </Link>
            <span>/</span>
            <Link href={`/${lang}/suppliers`} className="hover:text-blue-600">Suppliers</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{brand.name}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{brand.name}</h1>
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Verified
              </span>
            </div>

            {brand.tagline && (
              <p className="text-xl text-gray-600 mb-4 leading-relaxed">{brand.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {brand.country && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth={2}/></svg>
                  {brand.country}
                </span>
              )}
              {brand.founded_year && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/><line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/><line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/><line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/></svg>
                  Founded {brand.founded_year}
                </span>
              )}
              {brand.product_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                  {brand.product_count} products
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              {brand.website_url && (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-700 transition-colors"
                >
                  Visit Website
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
              )}
              <button className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                Save
              </button>
              <button className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Contact
              </button>
            </div>
          </div>

          {/* Logo */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-8 flex items-center justify-center min-h-[160px]">
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} className="max-w-full max-h-32 object-contain" />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-4xl font-bold text-blue-600">
                  {brand.name?.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 border-b border-gray-200">
          <nav className="flex gap-8 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-10">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                {brand.description ? (
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: brand.description }} />
                ) : (
                  <div>
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                      <strong className="text-gray-900">{brand.name}</strong> is a leading manufacturer and supplier in the unmanned systems industry, providing high-quality products and solutions for UAV, UGV and robotics applications.
                    </p>
                    {brand.tagline && (
                      <p className="text-gray-600 leading-relaxed">{brand.tagline}</p>
                    )}
                    <p className="text-gray-600 leading-relaxed mt-4">
                      With a comprehensive product portfolio covering airframes, propulsion systems, sensors, communication equipment and more, {brand.name} serves customers worldwide with reliable and innovative solutions for both commercial and defense applications.
                    </p>
                  </div>
                )}

                {/* Solution Categories */}
                {brand.solution_categories && brand.solution_categories.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Capabilities</h3>
                    <div className="flex flex-wrap gap-2">
                      {brand.solution_categories.map((cat: string) => (
                        <span key={cat} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
                          {cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Company Info</h3>
                  <div className="space-y-3 text-sm">
                    {brand.country && (
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth={2}/></svg>
                        <div>
                          <div className="text-gray-500">Headquarters</div>
                          <div className="font-medium text-gray-900">{brand.country}</div>
                        </div>
                      </div>
                    )}
                    {brand.founded_year && (
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2}/><line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/><line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/><line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/></svg>
                        <div>
                          <div className="text-gray-500">Founded</div>
                          <div className="font-medium text-gray-900">{brand.founded_year}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                      <div>
                        <div className="text-gray-500">Products</div>
                        <div className="font-medium text-gray-900">{brand.product_count || products.length} items</div>
                      </div>
                    </div>
                  </div>
                </div>

                {brand.website_url && (
                  <a
                    href={brand.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-blue-600 text-white text-center py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    Visit Official Website →
                  </a>
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map(p => (
                    <Link
                      key={p.id}
                      href={`/${lang}/products/${p.slug || p.id}`}
                      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                        {p.main_image ? (
                          <img src={p.main_image} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">{p.name}</h4>
                        {p.price && (
                          <div className="text-lg font-bold text-blue-600">${p.price}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">No products available for this supplier yet.</div>
              )}
            </div>
          )}

          {activeTab === 'solutions' && (
            <div className="text-center py-16 text-gray-400">
              <p>Solution content coming soon.</p>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="text-center py-16 text-gray-400">
              <p>Documents and resources coming soon.</p>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="max-w-xl">
              <div className="bg-gray-50 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact {brand.name}</h3>
                <div className="space-y-4">
                  {brand.website_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <a href={brand.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{brand.website_url}</a>
                    </div>
                  )}
                  {brand.country && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <p className="text-gray-900">{brand.country}</p>
                    </div>
                  )}
                </div>
                <button className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Send Inquiry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Related Suppliers */}
        {relatedBrands.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Suppliers</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedBrands.map(rb => (
                <Link
                  key={rb.id}
                  href={`/${lang}/suppliers/${rb.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-all group"
                >
                  <div className="h-16 flex items-center justify-center mb-3">
                    {rb.logo_url ? (
                      <img src={rb.logo_url} alt={rb.name} className="max-w-full max-h-12 object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-400">
                        {rb.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{rb.name}</h4>
                  {rb.product_count > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{rb.product_count} products</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
