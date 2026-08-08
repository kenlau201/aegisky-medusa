'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

const SOLUTIONS = [
  { id: 'vehicles', name: 'Unmanned Vehicles & Platforms', desc: 'Complete UAV, UGV, USV platforms including multirotors, fixed-wing, VTOL', icon: '🚁', color: 'from-blue-500 to-blue-600' },
  { id: 'sensors', name: 'Mission Sensors & Payloads', desc: 'Cameras, gimbals, lidar, thermal imaging, EO/IR and survey payloads', icon: '📷', color: 'from-green-500 to-green-600' },
  { id: 'propulsion', name: 'Propulsion & Power', desc: 'Motors, ESCs, propellers, batteries, fuel cells and charging solutions', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  { id: 'command-control', name: 'Command & Control', desc: 'C2 systems, data links, radios, telemetry and communication equipment', icon: '📡', color: 'from-purple-500 to-purple-600' },
  { id: 'positioning', name: 'Positioning & Navigation', desc: 'GPS/GNSS, IMU, RTK, compasses and high-precision navigation systems', icon: '🧭', color: 'from-indigo-500 to-indigo-600' },
  { id: 'software', name: 'Software & Autonomy', desc: 'Autopilot, flight controllers, mission planning, AI and SDK platforms', icon: '💻', color: 'from-cyan-500 to-cyan-600' },
  { id: 'electronics', name: 'Electronics & Subsystems', desc: 'Circuit boards, embedded systems, power modules and electronic components', icon: '🔌', color: 'from-pink-500 to-pink-600' },
  { id: 'structural', name: 'Structural & Mechanical', desc: 'Airframes, frames, landing gear, servos and precision mechanical parts', icon: '⚙️', color: 'from-gray-500 to-gray-600' },
  { id: 'materials', name: 'Materials & Manufacturing', desc: 'Carbon fiber, composites, 3D printing, CNC machining and advanced materials', icon: '🏭', color: 'from-orange-500 to-red-500' },
  { id: 'counter-uas', name: 'Counter-UAS', desc: 'Anti-drone systems, detection radar, jamming and airspace security', icon: '🎯', color: 'from-red-500 to-red-600' },
  { id: 'safety', name: 'Safety Systems', desc: 'Parachutes, failsafe, collision avoidance and recovery systems', icon: '🛡️', color: 'from-teal-500 to-teal-600' },
  { id: 'services', name: 'Professional Services', desc: 'Training, maintenance, inspection, surveying, mapping and consulting', icon: '💼', color: 'from-amber-500 to-amber-600' },
];

export default function SolutionsPage() {
  const params = useParams();
  const lang = params.lang as string;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Solutions by Application</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore unmanned system solutions organized by capability and application area.
            Find the right suppliers and products for your specific mission requirements.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOLUTIONS.map(sol => (
            <Link
              key={sol.id}
              href={`/${lang}/solutions/${sol.id}`}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
            >
              <div className={`h-32 bg-gradient-to-br ${sol.color} flex items-center justify-center text-5xl`}>
                {sol.icon}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {sol.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{sol.desc}</p>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                  Explore solutions
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
