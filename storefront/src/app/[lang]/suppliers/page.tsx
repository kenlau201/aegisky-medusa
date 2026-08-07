import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { pool as db } from '@/lib/control-tower/db';
import { JsonLd } from '@/components/geo/JsonLd';
import { generateCollectionPageSchema, generateWebSiteSchema } from '@/lib/geo/schema-generator';

export const revalidate = 3600; // ISR 1小时

export const metadata: Metadata = {
  title: 'Verified Drone Suppliers & Manufacturers | Aegisky',
  description: 'Browse 400+ verified industrial drone suppliers and manufacturers. All suppliers undergo business verification, product certification, and export compliance screening.',
};

// 工业级技术分类（参考UST分类法）
const TECHNOLOGY_CATEGORIES = [
  { name: 'Unmanned Vehicles & Platforms', icon: '🚁', slug: 'vehicles', count: 128 },
  { name: 'Propulsion & Power', icon: '⚡', slug: 'propulsion', count: 86 },
  { name: 'Sensors & Payloads', icon: '📡', slug: 'sensors', count: 94 },
  { name: 'Command & Control (C2)', icon: '📻', slug: 'c2', count: 67 },
  { name: 'Software & Autonomy', icon: '💻', slug: 'software', count: 52 },
  { name: 'Electronics & Subsystems', icon: '🔌', slug: 'electronics', count: 78 },
  { name: 'Positioning & Navigation', icon: '🧭', slug: 'navigation', count: 45 },
  { name: 'Counter-UAS', icon: '🛡️', slug: 'counter-uas', count: 23 },
  { name: 'Structural & Mechanical', icon: '⚙️', slug: 'mechanical', count: 59 },
  { name: 'Materials & Manufacturing', icon: '🏭', slug: 'materials', count: 34 },
  { name: 'Safety Systems', icon: '🔒', slug: 'safety', count: 28 },
  { name: 'Professional Services', icon: '💼', slug: 'services', count: 41 },
];

async function getSuppliers() {
  try {
    const result = await db.query(`
      SELECT b.id, b.name, b.slug, b.logo_url, b.description,
             b.product_count,
             COALESCE(b.product_count, 0) as product_count
      FROM aegisky_brands b
      ORDER BY b.product_count DESC NULLS LAST
      LIMIT 500
    `);
    return result.rows;
  } catch (e) {
    console.error('Error fetching suppliers:', e);
    return [];
  }
}

export default async function SuppliersPage({ params }: { params: { lang: string } }) {
  const suppliers = await getSuppliers();

  const jsonLd = generateCollectionPageSchema({
    name: 'Verified Drone Suppliers & Manufacturers',
    description: 'Browse 400+ verified industrial drone suppliers and manufacturers on Aegisky.',
    url: `https://aegisky.com/${params.lang}/suppliers`,
    numberOfItems: suppliers.length,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={[jsonLd, generateWebSiteSchema()]} />

      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href={`/${params.lang}`} className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Suppliers & Solutions</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Verified Drone Suppliers & Manufacturers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mb-8">
            Discover world-leading unmanned systems technology. All suppliers undergo business verification,
            product certification review, and export compliance screening.
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
              <span className="text-blue-600">✓</span>
              <span className="font-medium">{suppliers.length}+ Verified Suppliers</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
              <span className="text-green-600">✓</span>
              <span className="font-medium">CE/FCC/ISO Certified</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full">
              <span className="text-purple-600">✓</span>
              <span className="font-medium">Export Compliance Screened</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Categories */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Technology Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {TECHNOLOGY_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${params.lang}/suppliers?category=${cat.slug}`}
              className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1">
                {cat.name}
              </h3>
              <p className="text-sm text-gray-500">{cat.count} suppliers</p>
            </Link>
          ))}
        </div>

        {/* Featured Suppliers */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Featured Suppliers
        </h2>

        {suppliers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">Loading suppliers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {suppliers.map((supplier: any) => (
              <Link
                key={supplier.id}
                href={`/${params.lang}/suppliers/${supplier.slug || supplier.id}`}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden group"
              >
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center p-6 relative">
                  {supplier.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={supplier.logo_url}
                      alt={supplier.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-gray-300">
                      {supplier.name?.charAt(0)}
                    </span>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Verified
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600">
                    {supplier.name}
                  </h3>
                  {supplier.country && (
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                      📍 {supplier.country}
                    </p>
                  )}
                  {supplier.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {supplier.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {supplier.product_count} products
                    </span>
                    <span className="text-blue-600 text-sm font-medium group-hover:underline">
                      View Profile →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Are you a drone manufacturer or supplier?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join 400+ verified suppliers on the world's most trusted B2B platform for industrial drones.
            Get access to global enterprise buyers with built-in compliance.
          </p>
          <Link
            href={`/${params.lang}/become-supplier`}
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Become a Verified Supplier →
          </Link>
        </div>
      </div>
    </div>
  );
}
