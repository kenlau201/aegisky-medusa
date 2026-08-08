'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SOLUTION_CATEGORIES } from '@/lib/suppliers/solutions';

export default function SolutionsPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm text-blue-300 mb-4">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Technology Domains
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">UAV Technology Categories</h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Browse {totalSuppliers || 439}+ verified suppliers across 12 specialized technology domains.
              Each supplier is classified by their core technology expertise — from complete air vehicles
              to individual components, software, and professional services.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOLUTION_CATEGORIES.map(cat => {
            const count = categoryCounts[cat.id] || 0;
            return (
              <Link
                key={cat.id}
                href={`/zh/solutions/${cat.id}`}
                className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-gray-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${cat.bgColor} rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{cat.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`text-sm font-semibold ${cat.color}`}>
                        {loading ? '...' : `${count} suppliers`}
                      </span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Looking for a specific component or solution?</h2>
          <p className="text-blue-100 mb-6">Search all 6,344 products across our verified supplier network</p>
          <Link
            href="/zh/suppliers"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Browse All Suppliers
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
