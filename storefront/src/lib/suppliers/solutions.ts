// 12个无人机系统解决方案分类（参考 unmannedsystemstechnology.com）

export interface SolutionCategory {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  longDescription: string;
}

export const SOLUTION_CATEGORIES: SolutionCategory[] = [
  {
    id: 'counter-uas',
    name: 'Counter-UAS',
    shortName: 'Counter-UAS',
    icon: '🎯',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Anti-drone detection, tracking and neutralization systems',
    longDescription: 'Counter-UAS systems provide detection, tracking, identification and neutralization of unauthorized drones. Includes radar, RF detection, optical sensors, jammers and kinetic solutions for airspace security, critical infrastructure protection, military and law enforcement applications.',
  },
  {
    id: 'command-control',
    name: 'Command, Control & Communications',
    shortName: 'Command & Control',
    icon: '📡',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'C2 systems, data links, radios and telemetry',
    longDescription: 'Command and control systems, data links, radio communication equipment, telemetry modules, ground control stations and network infrastructure for reliable unmanned systems operations across all domains.',
  },
  {
    id: 'electronics',
    name: 'Electronics & Subsystems',
    shortName: 'Electronics',
    icon: '🔌',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Electronic components, boards and embedded systems',
    longDescription: 'Electronic components, circuit boards, embedded systems, power management modules, sensors, connectors, wiring harnesses and other critical subsystems for UAV manufacturing and integration.',
  },
  {
    id: 'structural',
    name: 'Structural & Mechanical Systems',
    shortName: 'Structural',
    icon: '⚙️',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'Airframes, frames, landing gear and mechanical parts',
    longDescription: 'Airframe structures, landing gear, mechanical components, servo actuators, mounting systems, fasteners and precision mechanical parts for unmanned vehicles and robotic systems.',
  },
  {
    id: 'positioning',
    name: 'Positioning, Navigation & Timing',
    shortName: 'Positioning & Navigation',
    icon: '🧭',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'GPS, GNSS, IMU, RTK and navigation systems',
    longDescription: 'High-precision navigation systems including GPS/GNSS receivers, IMUs, RTK modules, compasses, altimeters, barometers and guidance systems for accurate UAV positioning and autonomous navigation.',
  },
  {
    id: 'sensors',
    name: 'Mission Sensors & Payloads',
    shortName: 'Sensors & Payloads',
    icon: '📷',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Cameras, gimbals, lidar, thermal and EO/IR',
    longDescription: 'Mission payloads including EO/IR cameras, gimbals, lidar scanners, thermal imaging, multispectral and hyperspectral sensors, survey equipment and specialized payloads for UAV applications.',
  },
  {
    id: 'propulsion',
    name: 'Propulsion & Power',
    shortName: 'Propulsion',
    icon: '⚡',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Motors, ESCs, propellers, batteries and fuel systems',
    longDescription: 'Propulsion systems including brushless motors, ESCs, propellers, LiPo batteries, fuel cells, hybrid power systems, BECs, charging solutions and power distribution for electric and hybrid UAVs.',
  },
  {
    id: 'materials',
    name: 'Materials & Manufacture',
    shortName: 'Materials',
    icon: '🏭',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Carbon fiber, composites, 3D printing and CNC',
    longDescription: 'Advanced materials including carbon fiber, composites, 3D printing filaments and services, CNC machining, aluminum, titanium and engineering plastics for UAV airframe and component manufacturing.',
  },
  {
    id: 'safety',
    name: 'Safety Systems',
    shortName: 'Safety',
    icon: '🛡️',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    description: 'Parachutes, failsafe, recovery and collision avoidance',
    longDescription: 'Safety systems including ballistic parachutes, failsafe mechanisms, collision avoidance sensors, emergency recovery systems, redundancy solutions, ADS-B transceivers and airspace safety equipment for UAV operations.',
  },
  {
    id: 'services',
    name: 'Professional Services',
    shortName: 'Services',
    icon: '💼',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    description: 'Training, consulting, maintenance and operations',
    longDescription: 'Professional services including flight training, maintenance and repair, inspection services, aerial surveying, mapping, photogrammetry, consulting, integration and operational support for UAV deployments.',
  },
  {
    id: 'software',
    name: 'Software & Autonomy',
    shortName: 'Software',
    icon: '💻',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    description: 'Autopilot, flight control, AI and mission planning',
    longDescription: 'Software solutions including autopilot systems (PX4, ArduPilot), flight controllers, mission planning software, AI algorithms, computer vision, fleet management, SDK platforms and data processing tools.',
  },
  {
    id: 'vehicles',
    name: 'Unmanned Vehicles & Platforms',
    shortName: 'Vehicles & Platforms',
    icon: '🚁',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    description: 'Complete UAV, UGV, USV and robotic systems',
    longDescription: 'Complete unmanned vehicle platforms including multirotors, fixed-wing UAVs, VTOL aircraft, helicopters, ground vehicles, surface vessels and underwater robots for commercial, industrial and defense applications.',
  },
];

export function getCategoryById(id: string): SolutionCategory | undefined {
  return SOLUTION_CATEGORIES.find(c => c.id === id);
}

export function getCategoryIcon(id: string): string {
  return SOLUTION_CATEGORIES.find(c => c.id === id)?.icon || '📦';
}
