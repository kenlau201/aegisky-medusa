'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORY_INFO: Record<string, { name: string; subtitle: string; description: string; icon: string }> = {
  'counter-uas': {
    name: 'Counter-UAS',
    subtitle: 'Anti-Drone Systems & Detection',
    description: 'Counter-drone systems, detection radar, jamming technologies and C-UAS solutions for airspace security, critical infrastructure protection and defense applications.',
    icon: '🎯',
  },
  'command-control': {
    name: 'Command, Control & Communications',
    subtitle: 'C2 Systems, Data Links & Radios',
    description: 'Command and control systems, data links, radio communication equipment, telemetry modules and network infrastructure for unmanned systems operations.',
    icon: '📡',
  },
  'electronics': {
    name: 'Electronics & Subsystems',
    subtitle: 'Electronic Components & Modules',
    description: 'Electronic components, circuit boards, embedded systems, power management modules, sensors and other critical subsystems for UAV manufacturing.',
    icon: '🔌',
  },
  'structural': {
    name: 'Structural & Mechanical Systems',
    subtitle: 'Airframes, Frames & Mechanical Components',
    description: 'Airframe structures, landing gear, mechanical components, servo actuators, mounting systems and precision mechanical parts for unmanned vehicles.',
    icon: '⚙️',
  },
  'positioning': {
    name: 'Positioning, Navigation & Guidance',
    subtitle: 'GPS, GNSS, IMU & Navigation Systems',
    description: 'High-precision navigation systems including GPS/GNSS receivers, IMUs, RTK modules, compasses, altimeters and guidance systems for UAVs.',
    icon: '🧭',
  },
  'sensors': {
    name: 'Mission Sensors & Payloads',
    subtitle: 'Cameras, Lidar, Thermal & EO/IR',
    description: 'Mission payloads including EO/IR cameras, gimbals, lidar scanners, thermal imaging, multispectral sensors and survey equipment for UAV applications.',
    icon: '📷',
  },
  'propulsion': {
    name: 'Propulsion & Power',
    subtitle: 'Motors, ESCs, Batteries & Propellers',
    description: 'Propulsion systems including brushless motors, ESCs, propellers, LiPo batteries, fuel cells, hybrid power systems and charging solutions for drones.',
    icon: '⚡',
  },
  'materials': {
    name: 'Materials & Manufacturing',
    subtitle: 'Carbon Fiber, Composites & CNC',
    description: 'Advanced materials including carbon fiber, composites, 3D printing, CNC machining, aluminum and titanium components for UAV manufacturing.',
    icon: '🏭',
  },
  'safety': {
    name: 'Safety Systems',
    subtitle: 'Parachutes, Failsafe & Recovery',
    description: 'Safety systems including parachutes, failsafe mechanisms, collision avoidance, emergency recovery systems, redundancy solutions and airspace safety equipment.',
    icon: '🛡️',
  },
  'services': {
    name: 'Professional Services',
    subtitle: 'Training, Consulting & Maintenance',
    description: 'Professional services including flight training, maintenance and repair, inspection services, aerial surveying, mapping, consulting and operational support.',
    icon: '💼',
  },
  'software': {
    name: 'Software & Autonomy',
    subtitle: 'Autopilot, Flight Control & AI',
    description: 'Software solutions including autopilot systems (PX4, ArduPilot), flight controllers, mission planning software, AI algorithms and SDK platforms.',
    icon: '💻',
  },
  'vehicles': {
    name: 'Unmanned Vehicles & Platforms',
    subtitle: 'UAV, UGV, USV & Complete Systems',
    description: 'Complete unmanned vehicle platforms including multirotors, fixed-wing UAVs, VTOL aircraft, helicopters, ground vehicles and surface vessels.',
    icon: '🚁',
  },
};

export default function SolutionCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const categoryId = params.category as string;

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'products'>('suppliers');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const info = CATEGORY_INFO[categoryId] || {
    name: categoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    subtitle: 'Category',
    description: 'Browse suppliers and products in this category.',
    icon: '📦',
  };

  useEffect(() => {
    setLoading(true);
    // 获取该分类下的供应商
    fetch(`/api/suppliers?category=${categoryId}&page=1&pageSize=24`)
      .then(r => r.json())
      .then(data => {
        setSuppliers(data.suppliers || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href={`/${lang}`} className="hover:text-blue-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </Link>
            <span>/</span>
            <Link href={`/${lang}/suppliers`} className="hover:text-blue-600">Suppliers</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{info.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            <div className="lg:col-span-2">
              <div className="text-blue-400 text-sm font-semibold tracking-wider uppercase mb-3">Leading Global Suppliers</div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{info.name}</h1>
              <p className="text-xl text-gray-300 mb-4">{info.subtitle}</p>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-2xl">{info.description}</p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveTab('suppliers')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'suppliers' ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  View {total} Suppliers
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className="px-6 py-3 rounded-lg font-medium border border-white/30 text-white hover:bg-white/10 transition-colors"
                >
                  View Products
                </button>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="w-48 h-48 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center text-8xl">
                {info.icon}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        ) : activeTab === 'suppliers' ? (
          suppliers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {suppliers.map(s => (
                <Link
                  key={s.id}
                  href={`/${lang}/suppliers/${s.slug}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                    {s.logo_url ? (
                      <img src={s.logo_url} alt={s.name} className="max-w-full max-h-20 object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                        {s.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{s.name}</h3>
                    {s.tagline && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{s.tagline}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {s.country && <span>{s.country}</span>}
                      {s.product_count > 0 && <span>{s.product_count} products</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No suppliers found in this category yet.</p>
              <Link href={`/${lang}/suppliers`} className="text-blue-600 hover:underline mt-2 inline-block">Browse all suppliers →</Link>
            </div>
          )
        ) : (
          <ProductsByCategory categoryId={categoryId} lang={lang} />
        )}
      </div>
    </div>
  );
}

function ProductsByCategory({ categoryId, lang }: { categoryId: string; lang: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // 基于分类搜索商品
    const keywords: Record<string, string> = {
      'counter-uas': 'counter anti-drone jammer detection',
      'command-control': 'controller transmitter receiver telemetry radio antenna',
      'electronics': 'electronic circuit board module esc bec',
      'structural': 'frame landing gear mount bracket servo',
      'positioning': 'gps gnss compass imu navigation rtk',
      'sensors': 'camera sensor lidar thermal gimbal payload',
      'propulsion': 'motor propeller battery lipo engine',
      'materials': 'carbon fiber material composite 3d print cnc',
      'safety': 'parachute failsafe safety recovery',
      'services': 'service training consulting maintenance repair',
      'software': 'software autopilot px4 ardupilot flight controller',
      'vehicles': 'drone uav quadcopter multirotor fixed-wing vtol',
    };

    const kw = keywords[categoryId] || categoryId;
    fetch(`/api/products?search=${encodeURIComponent(kw)}&page=1&pageSize=24`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryId]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return <div className="text-center py-16 text-gray-500">No products found in this category.</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {products.map(p => (
        <Link
          key={p.id}
          href={`/${lang}/products/${p.slug || p.id}`}
          className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all"
        >
          <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
            {p.main_image ? (
              <img src={p.main_image} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
            )}
          </div>
          <div className="p-3">
            <h4 className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">{p.name}</h4>
            {p.price && <div className="text-sm font-bold text-blue-600">${p.price}</div>}
          </div>
        </Link>
      ))}
    </div>
  );
}
