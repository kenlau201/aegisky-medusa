import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { pool as db } from '@/lib/control-tower/db';
import { JsonLd } from '@/components/geo/JsonLd';
import { generateOrganizationSchema, generateBreadcrumbSchema } from '@/lib/geo/schema-generator';

export const revalidate = 3600;

async function getSupplier(slug: string) {
  try {
    // 先按slug查，再按id查
    const result = await db.query(`
      SELECT b.*,
             (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id) as product_count,
             (SELECT json_agg(json_build_object(
               'id', p.id,
               'title', p.title,
               'slug', p.slug,
               'thumbnail', p.thumbnail_url,
               'price', p.price
             )) FROM products p WHERE p.brand_id = b.id LIMIT 12) as products
      FROM brands b
      WHERE b.slug = $1 OR b.id::text = $1
    `, [slug]);

    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch (e) {
    console.error('Error fetching supplier:', e);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string; lang: string } }): Promise<Metadata> {
  const supplier = await getSupplier(params.slug);
  if (!supplier) return { title: 'Supplier Not Found' };

  return {
    title: `${supplier.name} - Verified Drone Supplier | Aegisky`,
    description: supplier.description || `${supplier.name} is a verified supplier of industrial drones and unmanned systems on Aegisky. View products, certifications, and contact information.`,
  };
}

export default async function SupplierDetailPage({ params }: { params: { slug: string; lang: string } }) {
  const supplier = await getSupplier(params.slug);
  if (!supplier) notFound();

  const baseUrl = 'https://aegisky.com';
  const supplierUrl = `${baseUrl}/${params.lang}/suppliers/${params.slug}`;

  const orgJsonLd = generateOrganizationSchema({
    id: supplier.id,
    name: supplier.name,
    url: supplierUrl,
    logo: supplier.logo_url,
    description: supplier.description,
    country: supplier.country,
    certifications: ['Verified Supplier', 'Export Compliance Screened'],
  });

  const breadcrumbJsonLd = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: `${baseUrl}/${params.lang}` },
      { name: 'Suppliers', url: `${baseUrl}/${params.lang}/suppliers` },
      { name: supplier.name, url: supplierUrl },
    ],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={[orgJsonLd, breadcrumbJsonLd]} />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/${params.lang}`} className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href={`/${params.lang}/suppliers`} className="hover:text-blue-600">Suppliers</Link>
            <span>/</span>
            <span className="text-gray-900">{supplier.name}</span>
          </div>
        </div>
      </div>

      {/* Supplier Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo */}
            <div className="w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200">
              {supplier.logo_url ? (
                <img
                  src={supplier.logo_url}
                  alt={supplier.name}
                  className="max-w-full max-h-full object-contain p-4"
                />
              ) : (
                <span className="text-5xl font-bold text-gray-300">{supplier.name?.charAt(0)}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
                <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              </div>

              {supplier.country && (
                <p className="text-gray-600 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {supplier.country}
                </p>
              )}

              {supplier.description && (
                <p className="text-lg text-gray-700 mb-6 max-w-3xl">
                  {supplier.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                {supplier.website && (
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Visit Website
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                <button className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Supplier
                </button>
                <button className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - 仿UST */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'CAPABILITY OVERVIEW' },
              { id: 'products', label: `PRODUCTS (${supplier.product_count || 0})` },
              { id: 'certifications', label: 'CERTIFICATIONS' },
              { id: 'articles', label: 'ARTICLES' },
              { id: 'locations', label: 'LOCATIONS' },
              { id: 'contact', label: 'CONTACT' },
            ].map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                className="py-4 px-1 border-b-2 border-transparent hover:border-blue-600 hover:text-blue-600 text-sm font-semibold text-gray-600 whitespace-nowrap transition-colors"
              >
                {tab.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Capability Overview */}
            <section id="overview">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Capability Overview</h2>
              <div className="prose max-w-none text-gray-700">
                {supplier.description ? (
                  <p>{supplier.description}</p>
                ) : (
                  <p className="text-gray-500">
                    {supplier.name} is a verified supplier on the Aegisky Global UAV Trusted Trade Network.
                    All products undergo compliance screening and certification verification.
                  </p>
                )}

                <div className="mt-6 grid grid-cols-2 gap-4 not-prose">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Core Capabilities</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>✓ Industrial UAV Manufacturing</li>
                      <li>✓ OEM/ODM Services</li>
                      <li>✓ Custom Engineering</li>
                      <li>✓ Global Shipping</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Quality Assurance</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>✓ ISO 9001 Certified</li>
                      <li>✓ CE/FCC Compliance</li>
                      <li>✓ Factory Inspection</li>
                      <li>✓ Product Testing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Products */}
            <section id="products">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Products</h2>
              {supplier.products && supplier.products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supplier.products.map((product: any) => (
                    <Link
                      key={product.id}
                      href={`/${params.lang}/products/${product.slug || product.id}`}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all flex gap-4"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover rounded" />
                        ) : (
                          <span className="text-gray-400 text-xs">No image</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 hover:text-blue-600">
                          {product.title}
                        </h4>
                        {product.price && (
                          <p className="text-blue-600 font-semibold mt-1">
                            ${product.price}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No products listed yet.</p>
              )}
            </section>

            {/* Certifications */}
            <section id="certifications">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Certifications & Compliance</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['CE Marking', 'FCC Part 15', 'ISO 9001', 'RoHS Compliant', 'REACH', 'FAA Remote ID Ready'].map((cert) => (
                  <div key={cert} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                      ✓
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{cert}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Articles */}
            <section id="articles">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Related Articles & News</h2>
              <p className="text-gray-500">Articles about this supplier will appear here.</p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Facts */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Company Facts</h3>
              <dl className="space-y-3 text-sm">
                {supplier.country && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Country</dt>
                    <dd className="font-medium text-gray-900">{supplier.country}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Products</dt>
                  <dd className="font-medium text-gray-900">{supplier.product_count || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Verification</dt>
                  <dd className="font-medium text-green-600">Verified</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Compliance</dt>
                  <dd className="font-medium text-green-600">Screened</dd>
                </div>
              </dl>
            </div>

            {/* Contact */}
            <div id="contact" className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Contact Supplier</h3>
              <p className="text-sm text-gray-600 mb-4">
                Request a quote, ask for samples, or discuss custom requirements.
              </p>
              <Link
                href={`/${params.lang}/rfq?supplier=${supplier.id}`}
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Send RFQ to {supplier.name}
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">Why Book Through Aegisky?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Payment protection & escrow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Pre-shipment inspection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Export compliance documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Global logistics support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
