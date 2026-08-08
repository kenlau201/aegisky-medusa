'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SOLUTION_CATEGORIES, getCategoryById } from '@/lib/suppliers/solutions';

// Sub-category descriptions for each technology domain (GEO content)
const CATEGORY_DETAILS: Record<string, {
  whatIs: string;
  keyComponents: string[];
  applications: string[];
  relatedCategories: string[];
}> = {
  'counter-uas': {
    whatIs: 'Counter-UAS (C-UAS) systems detect, track, identify, and neutralize unauthorized or hostile drones. These systems are critical for airspace security around airports, critical infrastructure, military installations, public events, and correctional facilities. Solutions range from passive RF detection and radar to optical tracking, jamming, and kinetic interception.',
    keyComponents: ['Radar systems', 'RF detectors', 'Optical/IR tracking', 'Jammers', 'Kinetic interceptors', 'Command & control software'],
    applications: ['Airport security', 'Critical infrastructure protection', 'Military & defense', 'Public event safety', 'Border patrol', 'Correctional facilities'],
    relatedCategories: ['command-control', 'sensors', 'software'],
  },
  'command-control': {
    whatIs: 'Command, Control & Communications (C3) systems form the nervous system of unmanned operations. This includes data links, radio systems, telemetry modules, ground control stations, antennas, and network infrastructure that enable reliable communication between operators and unmanned platforms across all domains.',
    keyComponents: ['Radio modems', 'Data links', 'Telemetry systems', 'Ground control stations', 'Antennas', 'Network routers', 'Video transmitters (VTX)', 'Receivers'],
    applications: ['Long-range BVLOS operations', 'Swarm coordination', 'Military C2', 'Telemetry & monitoring', 'Video downlink', 'Frequency management'],
    relatedCategories: ['electronics', 'software', 'positioning'],
  },
  'electronics': {
    whatIs: 'Electronic subsystems are the building blocks of every unmanned system. This category covers circuit boards, embedded computers, power distribution modules, connectors, wiring harnesses, sensors, and other critical electronic components that enable UAV manufacturing, integration, and repair.',
    keyComponents: ['Flight controllers', 'ESCs', 'PDBs (Power Distribution Boards)', 'Embedded computers', 'Connectors & wiring', 'Voltage regulators', 'LED systems', 'Development boards'],
    applications: ['Custom drone builds', 'Electronics integration', 'Repair & maintenance', 'Prototyping', 'Payload integration', 'Power management'],
    relatedCategories: ['command-control', 'propulsion', 'sensors', 'software'],
  },
  'structural': {
    whatIs: 'Structural and mechanical systems provide the airframe and physical framework of unmanned vehicles. This category includes frames, landing gear, servo actuators, mounting systems, fasteners, gimbals, and precision mechanical parts that determine flight characteristics, payload capacity, and durability.',
    keyComponents: ['Frames & airframes', 'Landing gear', 'Servo actuators', 'Gimbal mounts', 'Booms & arms', 'Fasteners & hardware', 'Vibration dampeners', 'Camera mounts'],
    applications: ['Multirotor frames', 'Fixed-wing structures', 'VTOL airframes', 'Payload mounting', 'Custom builds', 'Heavy-lift platforms'],
    relatedCategories: ['materials', 'propulsion', 'electronics'],
  },
  'positioning': {
    whatIs: 'Positioning, Navigation & Timing (PNT) systems enable UAVs to determine their location, orientation, and navigate autonomously. This includes GPS/GNSS receivers, IMUs, RTK modules for centimeter-level accuracy, compasses, barometers, and integrated navigation solutions for both line-of-sight and BVLOS operations.',
    keyComponents: ['GPS/GNSS modules', 'IMUs (Inertial Measurement Units)', 'RTK systems', 'Compasses/magnetometers', 'Barometric altimeters', 'Airspeed sensors', 'Range finders'],
    applications: ['Autonomous navigation', 'Precision mapping', 'Surveying & photogrammetry', 'Return-to-home', 'Waypoint missions', 'BVLOS operations'],
    relatedCategories: ['software', 'command-control', 'sensors'],
  },
  'sensors': {
    whatIs: 'Mission sensors and payloads are the eyes and ears of unmanned systems. This category covers EO/IR cameras, gimbals, lidar scanners, thermal imaging, multispectral and hyperspectral sensors, survey equipment, and specialized payloads that collect data for commercial, industrial, and defense applications.',
    keyComponents: ['EO/IR cameras', 'Gimbal systems', 'Lidar scanners', 'Thermal cameras', 'Multispectral sensors', 'Hyperspectral sensors', 'Laser rangefinders', 'Payload gimbals'],
    applications: ['Aerial photography & videography', 'Thermal inspection', 'Lidar mapping & surveying', 'Precision agriculture', 'Search & rescue', 'Infrastructure inspection', 'Surveillance'],
    relatedCategories: ['electronics', 'positioning', 'software', 'vehicles'],
  },
  'propulsion': {
    whatIs: 'Propulsion and power systems generate the thrust and electrical energy that drive unmanned vehicles. This category includes brushless motors, ESCs, propellers, LiPo batteries, fuel cells, hybrid power systems, BECs, charging solutions, and power distribution for electric and hybrid UAVs.',
    keyComponents: ['Brushless motors', 'ESCs (Electronic Speed Controllers)', 'Propellers', 'LiPo/Li-ion batteries', 'BECs/UBECs', 'Chargers', 'Power modules', 'Fuel cell systems', 'Hybrid generators'],
    applications: ['Multirotor propulsion', 'Fixed-wing power systems', 'Heavy-lift drones', 'Long-endurance platforms', 'Racing FPV', 'Battery management', 'Power distribution'],
    relatedCategories: ['electronics', 'vehicles', 'structural'],
  },
  'materials': {
    whatIs: 'Advanced materials and manufacturing technologies enable lightweight, strong, and durable unmanned systems. This category covers carbon fiber sheets and tubes, composite materials, 3D printing filaments and services, CNC machining, aluminum, titanium, and engineering plastics for UAV airframe and component manufacturing.',
    keyComponents: ['Carbon fiber sheets & tubes', 'Composite materials', '3D printing filaments', 'CNC machining services', 'Aluminum extrusions', 'Titanium parts', 'Engineering plastics', 'Adhesives & films'],
    applications: ['Custom airframe manufacturing', 'Lightweight structures', 'Prototyping', 'Replacement parts', 'CNC-milled components', '3D-printed brackets'],
    relatedCategories: ['structural', 'vehicles', 'services'],
  },
  'safety': {
    whatIs: 'Safety systems protect people, property, and aircraft during UAV operations. This category includes ballistic parachutes, failsafe mechanisms, collision avoidance sensors, emergency recovery systems, redundancy solutions, ADS-B transceivers, and airspace safety equipment for compliant and safe unmanned flight.',
    keyComponents: ['Ballistic parachutes', 'Failsafe systems', 'Collision avoidance sensors', 'ADS-B transceivers', 'Remote ID modules', 'Battery safety monitors', 'Redundancy systems', 'Geo-fencing software'],
    applications: ['Over-population flights', 'BVLOS compliance', 'Failsafe protection', 'Airspace integration', 'Emergency recovery', 'Regulatory compliance'],
    relatedCategories: ['software', 'command-control', 'positioning'],
  },
  'services': {
    whatIs: 'Professional services support the entire UAV lifecycle from training to operations. This category includes flight training programs, maintenance and repair services, inspection services, aerial surveying and mapping, photogrammetry processing, consulting, system integration, and operational support for UAV deployments.',
    keyComponents: ['Flight training', 'Maintenance & repair', 'Inspection services', 'Aerial surveying', 'Mapping & photogrammetry', 'Consulting', 'System integration', 'Fleet management'],
    applications: ['Pilot certification', 'Drone maintenance', 'Industrial inspection', 'Mapping projects', 'Agriculture surveys', 'Defense consulting', 'Fleet operations'],
    relatedCategories: ['software', 'vehicles', 'sensors'],
  },
  'software': {
    whatIs: 'Software and autonomy systems enable intelligent unmanned operations. This category covers autopilot firmware (PX4, ArduPilot), flight controllers, mission planning software, AI algorithms, computer vision, fleet management platforms, SDKs, and data processing tools for autonomous and semi-autonomous UAV missions.',
    keyComponents: ['Autopilot firmware (PX4/ArduPilot)', 'Mission planning software', 'Flight control software', 'AI & machine learning', 'Computer vision', 'Fleet management platforms', 'SDKs & APIs', 'Data processing tools'],
    applications: ['Autonomous flight', 'Mission planning', 'Swarm operations', 'Object detection & tracking', '3D mapping & modeling', 'Fleet management', 'AI-powered analytics'],
    relatedCategories: ['electronics', 'command-control', 'positioning', 'sensors'],
  },
  'vehicles': {
    whatIs: 'Complete unmanned vehicle platforms are ready-to-fly or ready-to-operate systems. This category includes multirotors, fixed-wing UAVs, VTOL aircraft, helicopters, ground vehicles (UGVs), surface vessels (USVs), and underwater robots (ROVs/AUVs) for commercial, industrial, and defense applications.',
    keyComponents: ['Multirotor drones (RTF/BNF)', 'Fixed-wing UAVs', 'VTOL aircraft', 'Unmanned helicopters', 'Ground vehicles (UGVs)', 'Surface vessels (USVs)', 'Underwater ROVs/AUVs', 'Ready-to-fly kits'],
    applications: ['Aerial photography & cinematography', 'Industrial inspection', 'Mapping & surveying', 'Agriculture', 'Delivery & logistics', 'Defense & security', 'FPV racing', 'Underwater inspection'],
    relatedCategories: ['propulsion', 'sensors', 'software', 'command-control'],
  },
};

function getTierBadge(supplier: any, index: number) {
  if (supplier.verified && (supplier.product_count >= 100 || index < 12)) {
    return { label: 'Platinum', class: 'bg-gradient-to-r from-gray-700 to-gray-900 text-white' };
  }
  if (supplier.verified || (supplier.product_count >= 30 && index < 40)) {
    return { label: 'Gold', class: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white' };
  }
  if (supplier.product_count >= 5) {
    return { label: 'Silver', class: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' };
  }
  return null;
}

export default function SolutionCategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const lang = params.lang as string;
  const category = getCategoryById(categoryId);
  const details = categoryId ? CATEGORY_DETAILS[categoryId] : null;

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loadingExtras, setLoadingExtras] = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    setPage(1);
    fetch(`/api/suppliers?category=${categoryId}&page=1&pageSize=24`)
      .then(r => r.json())
      .then(data => {
        setSuppliers(data.suppliers || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId || page === 1) return;
    fetch(`/api/suppliers?category=${categoryId}&page=${page}&pageSize=24`)
      .then(r => r.json())
      .then(data => {
        setSuppliers(data.suppliers || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        window.scrollTo({ top: 400, behavior: 'smooth' });
      });
  }, [categoryId, page]);

  useEffect(() => {
    if (!categoryId) return;
    setLoadingExtras(true);
    fetch(`/api/solutions/${categoryId}?products=12&articles=6`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        setArticles(data.articles || []);
        setTotalProducts(data.totalProducts || 0);
        setLoadingExtras(false);
      })
      .catch(() => setLoadingExtras(false));
  }, [categoryId]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
          <p className="text-gray-600 mb-4">The technology category you're looking for doesn't exist.</p>
          <Link href={`/${lang}/suppliers`} className="text-blue-600 hover:underline">← Browse all suppliers</Link>
        </div>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} Suppliers`,
    description: category.longDescription || category.description,
    numberOfItems: total,
    itemListElement: suppliers.slice(0, 24).map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Organization',
        name: s.name,
        description: s.tagline || s.description || '',
        url: `https://aegisky.com/${lang}/supplier/${s.slug}`,
      },
    })),
  };

  const relatedCats = details?.relatedCategories
    .map(id => SOLUTION_CATEGORIES.find(c => c.id === id))
    .filter(Boolean) || [];

  const otherCats = SOLUTION_CATEGORIES.filter(c => c.id !== categoryId);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
              <Link href={`/${lang}`} className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <Link href={`/${lang}/suppliers`} className="hover:text-blue-600">Suppliers</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{category.name}</span>
            </nav>

            <div className="flex items-start gap-5">
              <div className={`w-16 h-16 ${category.bgColor} rounded-2xl flex items-center justify-center text-3xl flex-shrink-0`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                <p className="text-gray-600 mt-2 max-w-3xl leading-relaxed">{category.longDescription || category.description}</p>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${category.bgColor} ${category.color}`}>
                    {loading ? 'Loading...' : `${total} Leading Supplier${total !== 1 ? 's' : ''}`}
                  </span>
                  <Link href={`/${lang}/suppliers`} className="text-sm text-blue-600 hover:underline">
                    Browse all suppliers →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Overview (GEO content) */}
        {details && (
          <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About {category.name}</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{details.whatIs}</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Key Components</h3>
                  <ul className="space-y-2">
                    {details.keyComponents.map(comp => (
                      <li key={comp} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 10.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        {comp}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Applications</h3>
                  <ul className="space-y-2">
                    {details.applications.map(app => (
                      <li key={app} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        {app}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Content + Sidebar Layout */}
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* === LEFT: Main Content === */}
            <div className="flex-1 min-w-0">
              {/* Suppliers Grid */}
              <section aria-label={`${category.name} suppliers`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Suppliers: {category.name}</h2>
                  <span className="text-sm text-gray-500 font-medium">{total} Suppliers</span>
                </div>

                {loading ? (
                  <div className="text-center py-20">
                    <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : suppliers.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">No suppliers found in this category.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {suppliers.map((s, idx) => {
                        const tier = getTierBadge(s, idx);
                        return (
                          <article
                            key={s.id}
                            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-200 transition-all flex flex-col"
                          >
                            {/* Header: Logo + Name + Tier */}
                            <div className="flex items-start gap-3 mb-3">
                              <Link href={`/${lang}/supplier/${s.slug}`} className="flex-shrink-0">
                                <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center p-2 hover:bg-gray-100 transition-colors">
                                  {s.logo_url ? (
                                    <img src={s.logo_url} alt={`${s.name} logo`} className="max-w-full max-h-full object-contain" />
                                  ) : (
                                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600">
                                      {s.name?.charAt(0)}
                                    </div>
                                  )}
                                </div>
                              </Link>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Link href={`/${lang}/supplier/${s.slug}`} className="hover:text-blue-600 transition-colors">
                                    <h3 className="font-bold text-gray-900 text-sm truncate">{s.name}</h3>
                                  </Link>
                                  {s.verified && (
                                    <span className="text-green-600 flex-shrink-0" title="Verified Supplier">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                      </svg>
                                    </span>
                                  )}
                                </div>
                                {tier && (
                                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${tier.class} shadow-sm`}>
                                    {tier.label}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Tagline */}
                            {s.tagline && (
                              <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2 flex-1">{s.tagline}</p>
                            )}

                            {/* Meta */}
                            <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3 flex-wrap">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                                {s.product_count}
                              </span>
                              {s.country && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth={2}/></svg>
                                  {s.country}
                                </span>
                              )}
                            </div>

                            {/* Cross-category tags */}
                            {s.solution_categories && s.solution_categories.filter((c: string) => c !== categoryId).slice(0, 2).length > 0 && (
                              <div className="flex items-center gap-1 mb-3 flex-wrap">
                                {s.solution_categories.filter((c: string) => c !== categoryId).slice(0, 2).map((catId: string) => {
                                  const cat = SOLUTION_CATEGORIES.find(c => c.id === catId);
                                  if (!cat) return null;
                                  return (
                                    <Link
                                      key={catId}
                                      href={`/${lang}/solutions/${catId}`}
                                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${cat.bgColor} ${cat.color} hover:opacity-80`}
                                    >
                                      {cat.icon} {cat.shortName}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-auto">
                              <Link
                                href={`/${lang}/supplier/${s.slug}`}
                                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
                              >
                                View Profile
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                                </svg>
                              </Link>
                              {s.website_url && (
                                <a
                                  href={s.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                                  title="Visit Website"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <nav className="flex justify-center items-center gap-2 mt-8" aria-label="Pagination">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 text-gray-600 text-sm">Page {page} of {totalPages}</span>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
                        >
                          Next
                        </button>
                      </nav>
                    )}
                  </>
                )}
              </section>

              {/* Products & Solutions */}
              <section className="mt-12" aria-label={`${category.name} products`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Products & Solutions</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {loadingExtras ? 'Loading...' : `${totalProducts.toLocaleString()} products in ${category.name}`}
                    </p>
                  </div>
                  <Link
                    href={`/${lang}/search?q=${encodeURIComponent(category.shortName || category.name)}`}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View all
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>

                {loadingExtras ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(p => (
                      <Link
                        key={p.id}
                        href={`/${lang}/products/${p.slug}`}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group"
                      >
                        <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                          {p.main_image ? (
                            <img src={p.main_image} alt={p.name} className="max-w-full max-h-24 object-contain group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-xs text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[32px]">
                            {p.name}
                          </h3>
                          {p.brand_name && (
                            <p className="text-[11px] text-gray-500 mt-1 truncate">{p.brand_name}</p>
                          )}
                          {p.price && (
                            <p className="text-sm font-bold text-gray-900 mt-1">
                              ${Number(p.price).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 text-sm">No products found.</div>
                )}
              </section>

              {/* Related Technology Domains */}
              {relatedCats.length > 0 && (
                <section className="mt-12">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Related Technology Domains</h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {relatedCats.map(cat => cat && (
                        <Link
                          key={cat.id}
                          href={`/${lang}/solutions/${cat.id}`}
                          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                        >
                          <div className={`w-10 h-10 ${cat.bgColor} rounded-lg flex items-center justify-center text-lg flex-shrink-0`}>
                            {cat.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-600">{cat.shortName}</div>
                            <div className="text-xs text-gray-500 line-clamp-1">{cat.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* === RIGHT: Sidebar === */}
            <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
              {/* Explore Other Categories */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 lg:sticky lg:top-24">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7"/>
                  </svg>
                  Explore Categories
                </h2>
                <div className="space-y-1.5">
                  {otherCats.map(c => {
                    const isActive = c.id === categoryId;
                    return (
                      <Link
                        key={c.id}
                        href={`/${lang}/solutions/${c.id}`}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                          isActive
                            ? `${c.bgColor} ${c.color} font-semibold`
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                      >
                        <span className="text-base">{c.icon}</span>
                        <span className="flex-1 truncate">{c.shortName}</span>
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Related Articles */}
              {articles.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                    </svg>
                    Related Articles
                  </h2>
                  <div className="space-y-4">
                    {articles.map(a => (
                      <Link
                        key={a.id}
                        href={`/${lang}/articles/${a.id}`}
                        className="block group"
                      >
                        {a.image_url && (
                          <div className="h-28 bg-gray-100 rounded-lg overflow-hidden mb-2">
                            <img src={a.image_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1">
                          {a.brand_name && <span className="font-medium text-blue-600">{a.brand_name}</span>}
                          {a.published_date && (
                            <span>· {new Date(a.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-xs text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {a.title}
                        </h3>
                        {a.summary && (
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{a.summary}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/${lang}/insights`}
                    className="block mt-4 text-center text-xs text-blue-600 hover:underline font-medium"
                  >
                    View all insights →
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className={`rounded-2xl p-8 text-center ${category.bgColor} border border-gray-200`}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Showcase your capabilities</h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto mb-4">
              If you design, build or supply {category.name}, create a profile to showcase your capabilities
              and connect with buyers who have an active requirement for your solutions.
            </p>
            <Link
              href={`/${lang}/suppliers`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              List Your Company
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
