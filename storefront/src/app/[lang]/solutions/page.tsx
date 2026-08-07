import { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/geo/JsonLd';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Industrial Drone Solutions by Industry | Aegisky',
  description: 'Drone solutions for surveying, agriculture, public safety, construction, inspection, and more. Find the right platform for your use case.',
};

const INDUSTRIES = [
  {
    slug: 'surveying-mapping',
    name: 'Surveying & Mapping',
    icon: '🗺️',
    description: 'RTK/PPK surveying drones for topographic mapping, cadastral survey, and volumetric calculations.',
    keyProducts: ['RTK Multirotors', 'VTOL Fixed-Wing', 'Photogrammetry Software'],
    specs: ['1-3cm accuracy', '500+ acres per flight', 'Mechanical shutter'],
    color: 'from-blue-500 to-blue-700',
  },
  {
    slug: 'agriculture',
    name: 'Agriculture & Spraying',
    icon: '🌾',
    description: 'Agricultural sprayers, multispectral imaging, and crop monitoring drones for precision farming.',
    keyProducts: ['Spraying Drones', 'Multispectral Cameras', 'Crop Health Analytics'],
    specs: ['10-50L tank', '4-8m spray width', 'Variable rate application'],
    color: 'from-green-500 to-green-700',
  },
  {
    slug: 'construction',
    name: 'Construction & Infrastructure',
    icon: '🏗️',
    description: 'Progress monitoring, site surveying, BIM integration, and infrastructure inspection.',
    keyProducts: ['Mapping Drones', 'Thermal Cameras', 'Progress Tracking Software'],
    specs: ['Orthomosaic maps', '3D point clouds', 'Digital twins'],
    color: 'from-orange-500 to-orange-700',
  },
  {
    slug: 'public-safety',
    name: 'Public Safety & Security',
    icon: '🚔',
    description: 'Thermal imaging, search and rescue, fire monitoring, and tactical situational awareness.',
    keyProducts: ['Thermal Drones', 'Zoom Cameras', 'Night Vision Payloads'],
    specs: ['640x512 thermal', '30x optical zoom', 'IP54 rated'],
    color: 'from-red-500 to-red-700',
  },
  {
    slug: 'inspection',
    name: 'Industrial Inspection',
    icon: '🔍',
    description: 'Power line, pipeline, wind turbine, solar farm, and infrastructure inspection.',
    keyProducts: ['Zoom Cameras', 'Thermal Imaging', 'Corona Detection'],
    specs: ['200x hybrid zoom', 'Radiometric thermal', 'Obstacle avoidance'],
    color: 'from-purple-500 to-purple-700',
  },
  {
    slug: 'mining',
    name: 'Mining & Quarries',
    icon: '⛏️',
    description: 'Stockpile volumetrics, site survey, blast monitoring, and haul road inspection.',
    keyProducts: ['Heavy-lift Drones', 'LiDAR Payloads', 'Volumetrics Software'],
    specs: ['1000+ acre coverage', 'LiDAR point clouds', 'Stockpile reports'],
    color: 'from-yellow-600 to-yellow-800',
  },
  {
    slug: 'energy',
    name: 'Energy & Utilities',
    icon: '⚡',
    description: 'Power line inspection, solar farm thermography, wind turbine blade inspection.',
    keyProducts: ['Thermal Drones', 'Corona Cameras', 'Inspection Software'],
    specs: ['Per-pixel temperature', 'Vegetation management', 'AI defect detection'],
    color: 'from-cyan-500 to-cyan-700',
  },
  {
    slug: 'defense-security',
    name: 'Defense & Security',
    icon: '🛡️',
    description: 'Tactical UAS, border patrol, ISR, and counter-UAS solutions for government users.',
    keyProducts: ['Tactical UAS', 'Counter-UAS', 'Encrypted Data Links'],
    specs: ['AES-256 encryption', 'BVLOS capable', 'MIL-STD tested'],
    color: 'from-gray-700 to-gray-900',
  },
  {
    slug: 'logistics',
    name: 'Logistics & Delivery',
    icon: '📦',
    description: 'Last-mile delivery, medical supply transport, and BVLOS logistics solutions.',
    keyProducts: ['Delivery Drones', 'Winch Systems', 'Fleet Management'],
    specs: ['5-20kg payload', '50km range', 'Automated landing'],
    color: 'from-indigo-500 to-indigo-700',
  },
  {
    slug: 'film-photography',
    name: 'Cinema & Aerial Photography',
    icon: '🎬',
    description: 'Professional cinema drones, heavy-lift platforms, and high-end camera systems.',
    keyProducts: ['Heavy-lift Drones', 'Cinema Cameras', 'Gimbal Systems'],
    specs: ['8K video', 'Full-frame sensors', 'ProRes/RAW'],
    color: 'from-pink-500 to-pink-700',
  },
];

export default function SolutionsPage({ params }: { params: { lang: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href={`/${params.lang}`} className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Solutions</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Industrial Drone Solutions by Industry
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Purpose-built drone platforms for every industry. Compare specifications, find verified suppliers,
            and source complete solutions for your use case.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INDUSTRIES.map(industry => (
            <Link
              key={industry.slug}
              href={`/${params.lang}/solutions/${industry.slug}`}
              className="bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden group"
            >
              <div className={`h-32 bg-gradient-to-br ${industry.color} flex items-center justify-center`}>
                <span className="text-6xl">{industry.icon}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                  {industry.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{industry.description}</p>

                <div className="space-y-2 mb-4">
                  {industry.specs.slice(0, 3).map(spec => (
                    <div key={spec} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      {spec}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <span className="text-blue-600 font-medium text-sm group-hover:underline">
                    View {industry.name} Solutions →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Don't see your industry?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            We work with customers across 50+ industries. Contact our solutions team to discuss your specific requirements.
          </p>
          <Link
            href={`/${params.lang}/contact`}
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Talk to a Solutions Engineer →
          </Link>
        </div>
      </div>
    </div>
  );
}
