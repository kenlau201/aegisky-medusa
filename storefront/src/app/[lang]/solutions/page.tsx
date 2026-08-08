'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SOLUTION_CATEGORIES } from '@/lib/suppliers/solutions';

export default function SolutionsPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/suppliers?page=1&pageSize=1')
      .then(r => r.json())
      .then(data => {
        const counts: Record<string, number> = {};
        (data.categories || []).forEach((c: any) => { counts[c.id] = c.count; });
        setCategoryCounts(counts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalSuppliers = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  // JSON-LD structured data for GEO/SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'UAV Technology Categories',
    description: 'Browse verified UAV and drone suppliers organized by 12 specialized technology domains including propulsion, sensors, avionics, airframes, software and more.',
    url: `https://aegisky.com/${lang}/solutions`,
    hasPart: SOLUTION_CATEGORIES.map(cat => ({
      '@type': 'Thing',
      name: cat.name,
      description: cat.longDescription,
      url: `https://aegisky.com/${lang}/solutions/${cat.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <Link href="/zh" className="hover:text-white">Home</Link>
              <span>/</span>
              <span className="text-white">Solutions</span>
            </nav>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm text-blue-300 mb-4">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                Technology Domains
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">UAV Technology Categories</h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Browse {totalSuppliers || 439}+ verified suppliers across 12 specialized technology domains.
                Each supplier is classified by their core technology expertise — from complete unmanned
                vehicles and propulsion systems to mission sensors, flight software, and professional services.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 10.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Verified manufacturers
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 10.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  6,385+ products
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 10.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Global supply chain
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-7xl mx-auto px-4 py-12" aria-label="All technology categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SOLUTION_CATEGORIES.map(cat => {
              const count = categoryCounts[cat.id] || 0;
              return (
                <article
                  key={cat.id}
                  className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-gray-300 transition-all"
                >
                  <Link href={`/${lang}/solutions/${cat.id}`} className="block">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 ${cat.bgColor} rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {cat.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{cat.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className={`text-sm font-semibold ${cat.color}`}>
                            {loading ? 'Loading...' : `${count} supplier${count !== 1 ? 's' : ''}`}
                          </span>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* About the Classification System */}
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How We Classify Suppliers</h2>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold mb-2">1</div>
                <h3 className="font-semibold text-gray-900 mb-1">Known Brand Mapping</h3>
                <p>190+ leading UAV brands are manually classified based on their established product portfolios and market position.</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold mb-2">2</div>
                <h3 className="font-semibold text-gray-900 mb-1">Product Category Analysis</h3>
                <p>Each supplier's actual product catalog is analyzed across 6,385+ products to determine their true technology focus.</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold mb-2">3</div>
                <h3 className="font-semibold text-gray-900 mb-1">Multi-Label Classification</h3>
                <p>Suppliers can span multiple domains — a manufacturer of both airframes and propulsion appears in both categories.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Looking for a specific component or solution?</h2>
            <p className="text-blue-100 mb-6">Search all 6,385 products across our verified supplier network</p>
            <Link
              href={`/${lang}/suppliers`}
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Browse All Suppliers
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
