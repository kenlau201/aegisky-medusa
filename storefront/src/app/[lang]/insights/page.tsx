import { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/geo/JsonLd';
import { generateCollectionPageSchema } from '@/lib/geo/schema-generator';

export const revalidate = 86400; // 24小时

export const metadata: Metadata = {
  title: 'Drone Industry Insights & Guides | Aegisky',
  description: 'Expert guides, industry analysis, and technical resources for industrial drone procurement, compliance, and deployment.',
};

// 种子文章 - 这些都是B2B买家在Google/AI上搜索的长尾问题
const ARTICLES = [
  {
    slug: 'industrial-drone-eccn-classification-guide-2026',
    title: 'ECCN Classification Guide for Industrial Drones (2026 Update)',
    excerpt: 'Complete guide to ECCN classification for commercial drones, including 9A012, 7A003, and EAR export control requirements.',
    category: 'Compliance',
    readTime: '12 min read',
    date: '2026-08-01',
    author: 'Aegisky Compliance Team',
    tags: ['ECCN', 'Export Control', 'EAR', 'Compliance'],
  },
  {
    slug: 'best-industrial-drones-for-surveying-mapping',
    title: 'Best Industrial Drones for Surveying & Mapping in 2026',
    excerpt: 'Compare the top 10 surveying drones for construction, mining, and land surveying. Includes RTK accuracy, flight time, and payload comparisons.',
    category: 'Buying Guides',
    readTime: '15 min read',
    date: '2026-07-28',
    author: 'Aegisky Engineering Team',
    tags: ['Surveying', 'Mapping', 'RTK', 'Construction'],
  },
  {
    slug: 'drone-export-compliance-checklist',
    title: 'Drone Export Compliance Checklist for Cross-Border Shipments',
    excerpt: 'Step-by-step checklist for legally exporting drones from China. Covers ECCN, license requirements, sanctions screening, and documentation.',
    category: 'Compliance',
    readTime: '10 min read',
    date: '2026-07-25',
    author: 'Aegisky Trade Team',
    tags: ['Export', 'Compliance', 'Customs', 'Documentation'],
  },
  {
    slug: 'oem-vs-odm-drone-manufacturing',
    title: 'OEM vs ODM Drone Manufacturing: How to Choose the Right Supplier',
    excerpt: 'Understanding the difference between OEM and ODM for drone projects. Key questions to ask manufacturers, MOQ considerations, and IP protection.',
    category: 'Sourcing',
    readTime: '8 min read',
    date: '2026-07-20',
    author: 'Aegisky Sourcing Team',
    tags: ['OEM', 'ODM', 'Manufacturing', 'Sourcing'],
  },
  {
    slug: 'counter-uas-technology-comparison',
    title: 'Counter-UAS Technologies Compared: Detection vs Mitigation',
    excerpt: 'Overview of C-UAS technologies including radar, RF detection, jamming, and kinetic solutions. Use cases and regulatory considerations.',
    category: 'Technology',
    readTime: '14 min read',
    date: '2026-07-15',
    author: 'Aegisky Technical Team',
    tags: ['Counter-UAS', 'C-UAS', 'Security', 'Anti-Drone'],
  },
  {
    slug: 'drone-battery-technology-guide',
    title: 'LiPo vs Li-ion Drone Batteries: Flight Time, Safety, and Lifespan',
    excerpt: 'Technical comparison of battery chemistries for industrial drones. Understanding C-rates, cycle life, temperature ranges, and transportation rules.',
    category: 'Technology',
    readTime: '11 min read',
    date: '2026-07-10',
    author: 'Aegisky Engineering Team',
    tags: ['Batteries', 'LiPo', 'Li-ion', 'Power Systems'],
  },
  {
    slug: 'drone-payload-integration-guide',
    title: 'Drone Payload Integration Guide: Cameras, Sensors, and Custom Payloads',
    excerpt: 'How to integrate third-party payloads with industrial drone platforms. Covers gimbal standards, communication protocols, and power requirements.',
    category: 'Technology',
    readTime: '13 min read',
    date: '2026-07-05',
    author: 'Aegisky Engineering Team',
    tags: ['Payloads', 'Gimbals', 'Sensors', 'Integration'],
  },
  {
    slug: 'agricultural-drone-sprayer-comparison',
    title: 'Agricultural Drone Sprayers Compared: DJI Agras vs Alternatives',
    excerpt: 'Complete comparison of agricultural spraying drones. Tank capacity, spray width, flow rate, and ROI calculations for farm operations.',
    category: 'Buying Guides',
    readTime: '12 min read',
    date: '2026-06-28',
    author: 'Aegisky Agriculture Team',
    tags: ['Agriculture', 'Sprayers', 'Agras', 'Farming'],
  },
  {
    slug: 'drone-flight-controller-comparison',
    title: 'Flight Controller Comparison: Pixhawk vs Cube vs Commercial Options',
    excerpt: 'Technical comparison of popular flight controllers for industrial drones. Processing power, sensor redundancy, and firmware options.',
    category: 'Technology',
    readTime: '16 min read',
    date: '2026-06-20',
    author: 'Aegisky Engineering Team',
    tags: ['Flight Controllers', 'Pixhawk', 'Cube', 'Autopilot'],
  },
  {
    slug: 'public-safety-drone-procurement-guide',
    title: 'Public Safety Drone Procurement Guide for Police & Fire Departments',
    excerpt: 'How to select drones for public safety use cases. Thermal cameras, night operations, BVLOS waivers, and budget considerations.',
    category: 'Buying Guides',
    readTime: '11 min read',
    date: '2026-06-15',
    author: 'Aegisky Public Safety Team',
    tags: ['Public Safety', 'Police', 'Fire', 'Thermal'],
  },
  {
    slug: 'drone-data-link-comparison',
    title: 'Drone Data Links Compared: 2.4GHz vs 5.8GHz vs 4G/5G',
    excerpt: 'Understanding C2 link technologies for industrial drones. Range, latency, interference resistance, and regulatory frequency bands.',
    category: 'Technology',
    readTime: '9 min read',
    date: '2026-06-10',
    author: 'Aegisky Communications Team',
    tags: ['Data Links', 'C2', 'Telemetry', 'Communication'],
  },
  {
    slug: 'drone-certification-guide-ce-fcc-iso',
    title: 'Drone Certifications Explained: CE, FCC, ISO, and What They Mean',
    excerpt: 'A plain-language guide to drone certifications. Which marks are required for which markets, and how to verify supplier claims.',
    category: 'Compliance',
    readTime: '7 min read',
    date: '2026-06-05',
    author: 'Aegisky Compliance Team',
    tags: ['Certification', 'CE', 'FCC', 'ISO'],
  },
];

const CATEGORIES = ['All', 'Compliance', 'Buying Guides', 'Sourcing', 'Technology'];

export default function InsightsPage({ params }: { params: { lang: string } }) {
  const jsonLd = generateCollectionPageSchema({
    name: 'Drone Industry Insights & Guides',
    description: 'Expert guides, industry analysis, and technical resources for industrial drone procurement.',
    url: `https://aegisky.com/${params.lang}/insights`,
    numberOfItems: ARTICLES.length,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href={`/${params.lang}`} className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Insights</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Drone Industry Insights & Guides
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Expert analysis, technical guides, and procurement resources for industrial drone professionals.
            Written by engineers and compliance experts.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        <div className="mb-12">
          <Link
            href={`/${params.lang}/insights/${ARTICLES[0].slug}`}
            className="block bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white hover:shadow-xl transition-shadow"
          >
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              FEATURED • {ARTICLES[0].category}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{ARTICLES[0].title}</h2>
            <p className="text-blue-100 text-lg mb-4 max-w-3xl">{ARTICLES[0].excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-blue-200">
              <span>{ARTICLES[0].author}</span>
              <span>•</span>
              <span>{ARTICLES[0].readTime}</span>
            </div>
          </Link>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARTICLES.slice(1).map(article => (
            <Link
              key={article.slug}
              href={`/${params.lang}/insights/${article.slug}`}
              className="bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden group"
            >
              <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <span className="text-5xl">📄</span>
                <span className="absolute top-3 left-3 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                  {article.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{article.readTime}</span>
                  <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gray-900 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Need help sourcing industrial drones?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Our team can help you find verified suppliers, navigate export compliance, and manage bulk orders.
          </p>
          <Link
            href={`/${params.lang}/become-supplier`}
            className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Talk to a Sourcing Expert →
          </Link>
        </div>
      </div>
    </div>
  );
}
