import { Metadata } from 'next';
import Link from 'next/link';
import { pool as db } from '@/lib/control-tower/db';
import { JsonLd } from '@/components/geo/JsonLd';
import { generateCollectionPageSchema, generateWebSiteSchema } from '@/lib/geo/schema-generator';

export const revalidate = 3600;

// 工业级技术分类（英文+俄文关键词，匹配俄文商品名）
const TECHNOLOGY_CATEGORIES = [
  { name: 'Unmanned Vehicles & Platforms', icon: '🚁', slug: 'vehicles', keywords: ['drone', 'uav', 'quadcopter', 'multirotor', 'fixed-wing', 'vtol', 'helicopter', 'aircraft', 'дрон', 'квадрокоптер', 'беспилотник', 'коптер', 'мультиротор', 'самолет', 'авиа', 'dji', 'mavic', 'phantom', 'matrice', 'autel'] },
  { name: 'Propulsion & Power', icon: '⚡', slug: 'propulsion', keywords: ['motor', 'esc', 'propeller', 'battery', 'lipo', 'engine', 'brushless', 'двигатель', 'мотор', 'регулятор', 'пропеллер', 'лопаст', 'аккумулятор', 'батарея', 'заряд', 't-motor', 'hobbywing'] },
  { name: 'Sensors & Payloads', icon: '📡', slug: 'sensors', keywords: ['camera', 'sensor', 'lidar', 'thermal', 'gimbal', 'payload', 'radar', 'imaging', 'камера', 'сенсор', 'лидар', 'тепловиз', 'подвес', 'стабилизатор', 'радар', 'фото', 'видео', 'flir', 'sony', 'gopro'] },
  { name: 'Command & Control (C2)', icon: '📻', slug: 'c2', keywords: ['remote', 'controller', 'transmitter', 'receiver', 'telemetry', 'radio', 'antenna', 'пульт', 'управления', 'передатчик', 'приемник', 'телеметр', 'радио', 'антенн', 'flysky', 'frsky', 'radiomaster'] },
  { name: 'Software & Autonomy', icon: '💻', slug: 'software', keywords: ['software', 'autopilot', 'px4', 'ardupilot', 'autonomy', 'algorithm', 'sdk', 'программ', 'автопилот', 'полетн', 'контроллер', 'прошивк', 'pixhawk', 'cube'] },
  { name: 'Electronics & Subsystems', icon: '🔌', slug: 'electronics', keywords: ['electronic', 'circuit', 'pcb', 'module', 'board', 'chip', 'bec', 'wiring', 'электрон', 'плата', 'модуль', 'схема', 'чип', 'провод', 'разъем'] },
  { name: 'Positioning & Navigation', icon: '🧭', slug: 'navigation', keywords: ['gps', 'gnss', 'compass', 'imu', 'navigation', 'rtk', 'accelerometer', 'gyro', 'gps', 'глонасс', 'компас', 'навигац', 'позицион', 'инерциаль', 'датчик'] },
  { name: 'Counter-UAS', icon: '🛡️', slug: 'counter-uas', keywords: ['counter', 'anti-drone', 'jammer', 'detection', 'cuas', 'jamming', 'противодейств', 'глушител', 'обнаруж', 'защит', 'безопасност'] },
  { name: 'Structural & Mechanical', icon: '⚙️', slug: 'mechanical', keywords: ['frame', 'landing gear', 'mount', 'bracket', 'hinge', 'clamp', 'servo', 'рама', 'шасси', 'креплен', 'кронштейн', 'сервопривод', 'механизм', 'подвес'] },
  { name: 'Materials & Manufacturing', icon: '🏭', slug: 'materials', keywords: ['carbon fiber', 'material', 'composite', '3d print', 'cnc', 'aluminum', 'карбон', 'углерод', 'материал', 'композит', 'печать', 'фрезер', 'алюмин', 'титан'] },
  { name: 'Safety Systems', icon: '🔒', slug: 'safety', keywords: ['safety', 'parachute', 'failsafe', 'emergency', 'recovery', 'protection', 'collision', 'redundancy', 'безопасност', 'парашют', 'катапульт', 'аварий', 'спасен', 'защит', 'отказоустой'] },
  { name: 'Professional Services', icon: '💼', slug: 'services', keywords: ['service', 'training', 'consulting', 'maintenance', 'repair', 'inspection', 'survey', 'mapping', 'обслуживан', 'обучен', 'консалтинг', 'ремонт', 'осмотр', 'съемка', 'картограф', 'услуг'] },
];

interface PageProps {
  params: { lang: string };
  searchParams: { category?: string; q?: string; page?: string };
}

async function getSuppliers(opts: { category?: string; search?: string; page?: number }) {
  const { category, search, page = 1 } = opts;
  const pageSize = 48;
  const offset = (page - 1) * pageSize;

  let whereClause = '';
  const params: any[] = [];
  const conditions: string[] = [];

  // Search filter
  if (search) {
    conditions.push(`(b.name ILIKE $${params.length + 1} OR b.description ILIKE $${params.length + 1})`);
    params.push(`%${search}%`);
  }

  // Category filter: find brands whose products match category keywords
  if (category) {
    const catConfig = TECHNOLOGY_CATEGORIES.find(c => c.slug === category);
    if (catConfig) {
      const startIdx = params.length;
      const keywordConditions = catConfig.keywords.map((_, i) => `p.name ILIKE $${startIdx + i + 1}`).join(' OR ');
      const keywordParams = catConfig.keywords.map(kw => `%${kw}%`);
      conditions.push(`EXISTS (SELECT 1 FROM aegisky_products p WHERE p.brands @> jsonb_build_array(jsonb_build_object('id', b.id))::jsonb AND (${keywordConditions}))`);
      params.push(...keywordParams);
    }
  }

  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  try {
    const countResult = await db.query(`SELECT COUNT(*) FROM aegisky_brands b ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(`
      SELECT b.id, b.name, b.slug, b.logo_url, b.description,
             COALESCE(b.product_count, 0) as product_count
      FROM aegisky_brands b
      ${whereClause}
      ORDER BY b.product_count DESC NULLS LAST, b.name ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, pageSize, offset]);

    return { suppliers: result.rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  } catch (e) {
    console.error('Error fetching suppliers:', e);
    return { suppliers: [], total: 0, page: 1, pageSize: 48, totalPages: 0 };
  }
}

async function getCategoryCounts() {
  const counts: Record<string, number> = {};
  for (const cat of TECHNOLOGY_CATEGORIES) {
    try {
      const keywordConditions = cat.keywords.map((kw, i) => `p.name ILIKE $${i + 1}`).join(' OR ');
      const keywordParams = cat.keywords.map(kw => `%${kw}%`);
      const result = await db.query(`
        SELECT COUNT(DISTINCT b.id) FROM aegisky_brands b
        WHERE EXISTS (SELECT 1 FROM aegisky_products p WHERE p.brands @> jsonb_build_array(jsonb_build_object('id', b.id))::jsonb AND (${keywordConditions}))
      `, keywordParams);
      counts[cat.slug] = parseInt(result.rows[0].count);
    } catch {
      counts[cat.slug] = 0;
    }
  }
  return counts;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const category = searchParams.category;
  const catConfig = TECHNOLOGY_CATEGORIES.find(c => c.slug === category);
  const title = catConfig
    ? `${catConfig.name} Suppliers & Manufacturers | Aegisky`
    : 'Verified Drone Suppliers & Manufacturers | Aegisky';
  return { title, description: 'Browse verified industrial drone suppliers and manufacturers on Aegisky.' };
}

export default async function SuppliersPage({ params, searchParams }: PageProps) {
  const category = searchParams.category;
  const search = searchParams.q;
  const page = parseInt(searchParams.page || '1');

  const catConfig = category ? TECHNOLOGY_CATEGORIES.find(c => c.slug === category) : null;
  const [{ suppliers, total, totalPages }, categoryCounts] = await Promise.all([
    getSuppliers({ category, search, page }),
    getCategoryCounts(),
  ]);

  const jsonLd = generateCollectionPageSchema({
    name: catConfig ? `${catConfig.name} Suppliers` : 'Verified Drone Suppliers & Manufacturers',
    description: 'Browse verified industrial drone suppliers and manufacturers on Aegisky.',
    url: `https://aegisky.com/${params.lang}/suppliers`,
    numberOfItems: total,
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
            {catConfig && (<><span>/</span><span className="text-blue-600">{catConfig.name}</span></>)}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {catConfig ? catConfig.name : 'Verified Drone Suppliers & Manufacturers'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mb-8">
            {catConfig
              ? `Browse verified suppliers specializing in ${catConfig.name.toLowerCase()} for industrial drone applications.`
              : 'Discover world-leading unmanned systems technology. All suppliers undergo business verification, product certification review, and export compliance screening.'}
          </p>

          {/* Search Bar */}
          <form action={`/${params.lang}/suppliers`} method="GET" className="flex gap-2 mb-6 max-w-xl">
            {category && <input type="hidden" name="category" value={category} />}
            <input
              type="text"
              name="q"
              defaultValue={search || ''}
              placeholder="Search suppliers by name or keyword..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Search
            </button>
            {(search || category) && (
              <Link href={`/${params.lang}/suppliers`} className="px-4 py-3 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                Clear
              </Link>
            )}
          </form>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
              <span className="text-blue-600">✓</span>
              <span className="font-medium">{total} Suppliers Found</span>
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

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Technology Categories */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Technology Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {TECHNOLOGY_CATEGORIES.map((cat) => {
            const isActive = category === cat.slug;
            const count = categoryCounts[cat.slug] || 0;
            return (
              <Link
                key={cat.slug}
                href={`/${params.lang}/suppliers?category=${cat.slug}`}
                className={`bg-white p-5 rounded-xl border transition-all group ${isActive ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' : 'border-gray-200 hover:border-blue-500 hover:shadow-md'}`}
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h3 className={`font-semibold mb-1 ${isActive ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'}`}>
                  {cat.name}
                </h3>
                <p className="text-sm text-gray-500">{count} suppliers</p>
              </Link>
            );
          })}
        </div>

        {/* Suppliers Grid */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {catConfig ? `${catConfig.name} Suppliers` : 'All Suppliers'}
            <span className="text-base font-normal text-gray-500 ml-3">({total})</span>
          </h2>
        </div>

        {suppliers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <p className="text-gray-500 text-lg mb-4">No suppliers found{search ? ` for "${search}"` : ''}{catConfig ? ` in ${catConfig.name}` : ''}.</p>
            <Link href={`/${params.lang}/suppliers`} className="text-blue-600 hover:underline">View all suppliers</Link>
          </div>
        ) : (
          <>
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
                        src={supplier.logo_url.startsWith('http') ? supplier.logo_url : `/images/brands/${supplier.logo_url}`}
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
                    {supplier.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {supplier.description.replace(/<[^>]*>/g, '').substring(0, 120)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {page > 1 && (
                  <Link
                    href={`/${params.lang}/suppliers?${new URLSearchParams({ ...(category && { category }), ...(search && { q: search }), page: String(page - 1) })}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    ← Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-gray-600">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/${params.lang}/suppliers?${new URLSearchParams({ ...(category && { category }), ...(search && { q: search }), page: String(page + 1) })}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Are you a drone manufacturer or supplier?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join verified suppliers on the world's most trusted B2B platform for industrial drones.
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
