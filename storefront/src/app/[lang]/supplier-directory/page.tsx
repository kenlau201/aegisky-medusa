'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Supplier {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  product_count: number;
  tagline: string;
  description: string;
  country: string;
  website_url: string;
  founded_year: number | null;
  solution_categories: string[];
  name_initial: string;
}

interface CategoryCount {
  cat: string;
  count: number;
}

interface LetterCount {
  letter: string;
  count: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  vehicles: 'UAV Platforms',
  propulsion: 'Propulsion',
  sensors: 'Sensors & Payloads',
  c2: 'C2 & Comms',
  navigation: 'Navigation',
  software: 'Software & AI',
  'counter-uas': 'Counter-UAS',
  mechanical: 'Mechanical',
  safety: 'Safety & Recovery',
  services: 'Services',
  electronics: 'Electronics',
  materials: 'Materials'
};

const CATEGORY_ICONS: Record<string, string> = {
  vehicles: '✈',
  propulsion: '⚡',
  sensors: '📡',
  c2: '📶',
  navigation: '🧭',
  software: '💻',
  'counter-uas': '🛡',
  mechanical: '⚙',
  safety: '🪂',
  services: '🔧',
  electronics: '🔌',
  materials: '🔩'
};

export default function SupplierDirectoryPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [letters, setLetters] = useState<LetterCount[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLetter, setSelectedLetter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const fetchSuppliers = async (cat: string, letter: string, q: string, p: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (cat !== 'all') params.set('category', cat);
    if (letter !== 'all') params.set('letter', letter);
    if (q) params.set('search', q);
    params.set('page', String(p));
    params.set('limit', '50');

    try {
      const res = await fetch(`/api/supplier-directory?${params}`);
      const data = await res.json();
      setSuppliers(data.suppliers || []);
      setCategories(data.categories || []);
      setLetters(data.letters || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(selectedCategory, selectedLetter, search, page);
  }, [selectedCategory, selectedLetter, search, page]);

  const totalPages = Math.ceil(total / 50);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🏭</span>
            <h1 className="text-3xl sm:text-4xl font-bold">Supplier Directory</h1>
          </div>
          <p className="text-lg text-blue-100 max-w-3xl mb-6">
            Browse verified UAV and unmanned systems suppliers from around the world. 
            Find components, platforms, sensors, software, and services for your drone program.
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-300">{total}</span>
              <span className="text-blue-200">Suppliers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-300">{categories.length}</span>
              <span className="text-blue-200">Categories</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-300">6,384</span>
              <span className="text-blue-200">Products</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search suppliers by name, product, or capability..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Filter by Technology</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedCategory('all'); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.cat}
                onClick={() => { setSelectedCategory(cat.cat); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat.cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>{CATEGORY_ICONS[cat.cat] || '•'}</span>
                {CATEGORY_LABELS[cat.cat] || cat.cat}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedCategory === cat.cat ? 'bg-blue-500' : 'bg-gray-100'
                }`}>{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Alphabet Filter */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Browse by Letter</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => { setSelectedLetter('all'); setPage(1); }}
              className={`w-9 h-9 rounded text-sm font-medium transition-colors ${
                selectedLetter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {alphabet.map((letter) => {
              const hasLetter = letters.find(l => l.letter === letter);
              return (
                <button
                  key={letter}
                  onClick={() => { setSelectedLetter(letter); setPage(1); }}
                  disabled={!hasLetter}
                  className={`w-9 h-9 rounded text-sm font-medium transition-colors ${
                    selectedLetter === letter
                      ? 'bg-blue-600 text-white'
                      : hasLetter
                        ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {loading ? 'Loading...' : `${total} Supplier${total !== 1 ? 's' : ''}`}
              {selectedCategory !== 'all' && ` in ${CATEGORY_LABELS[selectedCategory] || selectedCategory}`}
              {selectedLetter !== 'all' && ` starting with "${selectedLetter}"`}
              {search && ` matching "${search}"`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Supplier List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No suppliers found matching your criteria.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedLetter('all'); setSearch(''); setPage(1); }}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-start gap-5">
                  {/* Logo */}
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                    {supplier.logo ? (
                      <img
                        src={supplier.logo}
                        alt={supplier.name}
                        className="max-w-full max-h-full object-contain p-2"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-300">{supplier.name_initial}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{supplier.name}</h3>
                      {supplier.country && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">
                          {supplier.country}
                        </span>
                      )}
                      {supplier.founded_year && (
                        <span className="text-xs text-gray-400 flex-shrink-0">Est. {supplier.founded_year}</span>
                      )}
                    </div>
                    {supplier.tagline && (
                      <p className="text-blue-600 text-sm font-medium mb-2">{supplier.tagline}</p>
                    )}
                    {supplier.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{supplier.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      {supplier.solution_categories?.slice(0, 4).map((cat) => (
                        <span key={cat} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat] || cat}
                        </span>
                      ))}
                      {supplier.product_count > 0 && (
                        <span className="text-xs text-gray-400 ml-auto">{supplier.product_count} products</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <Link
                      href={`/en/suppliers/${supplier.slug}`}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center whitespace-nowrap"
                    >
                      View Profile
                    </Link>
                    {supplier.website_url && (
                      <a
                        href={supplier.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                      >
                        Visit Website ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
                    {supplier.logo ? (
                      <img
                        src={supplier.logo}
                        alt={supplier.name}
                        className="max-w-full max-h-full object-contain p-1"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-xl font-bold text-gray-300">{supplier.name_initial}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{supplier.name}</h3>
                    {supplier.country && (
                      <span className="text-xs text-gray-500">{supplier.country}</span>
                    )}
                  </div>
                </div>
                {supplier.tagline && (
                  <p className="text-blue-600 text-xs font-medium mb-2 line-clamp-1">{supplier.tagline}</p>
                )}
                {supplier.description && (
                  <p className="text-gray-600 text-xs line-clamp-3 mb-3">{supplier.description}</p>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                  {supplier.solution_categories?.slice(0, 3).map((cat) => (
                    <span key={cat} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/en/suppliers/${supplier.slug}`}
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 text-center"
                  >
                    View Profile
                  </Link>
                  {supplier.website_url && (
                    <a
                      href={supplier.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
                    >
                      ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 px-4">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
