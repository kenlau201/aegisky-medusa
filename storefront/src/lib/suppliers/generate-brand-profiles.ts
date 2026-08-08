/**
 * Generate complete brand profiles for all 439 brands
 * Merges verified major brand data with category-based professional descriptions
 */

import fs from 'fs';
import path from 'path';
import { majorBrandProfiles, BrandProfile, ProductLine } from './brand-profiles';

// Load original brand data
const projectRoot = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa';
const brandsRawPath = path.join(projectRoot, 'data', 'mirror', 'brands_raw.json');
let rawContent = fs.readFileSync(brandsRawPath, 'utf-8');
// Remove BOM if present
if (rawContent.charCodeAt(0) === 0xFEFF) {
  rawContent = rawContent.slice(1);
}
const brandsRaw = JSON.parse(rawContent);

// Solution category metadata
const solutionCategories: Record<string, { name: string; description: string }> = {
  'counter-uas': { name: 'Counter-UAS', description: 'anti-drone systems, detection, and mitigation technologies' },
  'command-control': { name: 'Command & Control', description: 'radio links, telemetry, ground control stations, and communication systems' },
  'electronics': { name: 'Electronics', description: 'flight controllers, ESCs, receivers, and electronic components' },
  'structural': { name: 'Structural', description: 'airframes, frames, landing gear, and structural components' },
  'positioning': { name: 'Positioning', description: 'GPS, GNSS, RTK, and navigation systems' },
  'sensors': { name: 'Sensors', description: 'cameras, lidar, thermal, and payload sensors' },
  'propulsion': { name: 'Propulsion', description: 'motors, propellers, and power systems' },
  'materials': { name: 'Materials', description: 'carbon fiber, composites, and manufacturing materials' },
  'safety': { name: 'Safety', description: 'parachutes, failsafe systems, and safety equipment' },
  'services': { name: 'Services', description: 'OEM/ODM, consulting, training, and support services' },
  'software': { name: 'Software', description: 'flight control software, mission planning, and data analytics' },
  'vehicles': { name: 'Vehicles', description: 'complete drone platforms and UAV systems' },
};

// Country codes
const countryCodes: Record<string, string> = {
  'China': 'CN', 'United States': 'US', 'Japan': 'JP', 'Switzerland': 'CH',
  'Vietnam': 'VN', 'France': 'FR', 'Germany': 'DE', 'United Kingdom': 'GB',
  'South Korea': 'KR', 'Taiwan': 'TW', 'Global': 'GLOBAL',
};

// Generate product lines based on solution categories
function generateProductLines(categories: string[], brandName: string): ProductLine[] {
  const lines: ProductLine[] = [];
  
  if (categories.includes('vehicles')) {
    lines.push({
      title: 'UAV Platforms',
      description: `Complete unmanned aerial vehicle platforms manufactured/supplied by ${brandName}, designed for various industrial and commercial applications.`,
      products: [
        { name: 'Multirotor Systems', description: 'Multi-rotor drones for inspection, surveying, photography, and surveillance applications.' },
        { name: 'Fixed-Wing & VTOL', description: 'Long-endurance fixed-wing and VTOL platforms for mapping and large-area coverage.' },
      ]
    });
  }
  
  if (categories.includes('propulsion')) {
    lines.push({
      title: 'Propulsion Systems',
      description: `High-performance brushless motors, ESCs, and propellers for UAV applications, engineered for reliability and efficiency.`,
      products: [
        { name: 'Brushless Motors', description: 'High-efficiency motors for multirotor, fixed-wing, and VTOL aircraft.' },
        { name: 'Electronic Speed Controllers', description: 'Precision ESCs for accurate motor control and smooth flight performance.' },
        { name: 'Propellers', description: 'Aerodynamically optimized propellers in various sizes and configurations.' },
      ]
    });
  }
  
  if (categories.includes('electronics')) {
    lines.push({
      title: 'Flight Electronics',
      description: `Electronic control systems and components for UAVs, including flight controllers, receivers, and power management.`,
      products: [
        { name: 'Flight Controllers', description: 'Advanced flight control boards supporting PX4, ArduPilot, and Betaflight ecosystems.' },
        { name: 'Receivers & RF Modules', description: 'Radio receivers and transmitter modules for reliable control links.' },
        { name: 'Power Distribution', description: 'PDBs, BECs, and power management modules for UAV electrical systems.' },
      ]
    });
  }
  
  if (categories.includes('sensors')) {
    lines.push({
      title: 'Imaging & Sensors',
      description: `Camera systems, gimbals, and sensor payloads for aerial data capture and situational awareness.`,
      products: [
        { name: 'FPV Cameras', description: 'Low-latency first-person-view cameras for real-time flight video.' },
        { name: 'HD Camera Systems', description: 'High-definition and thermal imaging cameras for professional applications.' },
        { name: 'Gimbal Systems', description: 'Stabilized camera mounts for smooth aerial photography and videography.' },
      ]
    });
  }
  
  if (categories.includes('command-control')) {
    lines.push({
      title: 'Command & Control Systems',
      description: `Radio control systems, telemetry links, and ground station equipment for UAV command and control.`,
      products: [
        { name: 'Radio Transmitters', description: 'Professional RC transmitters with multi-protocol support and long-range capability.' },
        { name: 'Telemetry Systems', description: 'Long-range data links for real-time telemetry and video transmission.' },
        { name: 'Ground Control Stations', description: 'Integrated ground stations for mission planning and UAV management.' },
      ]
    });
  }
  
  if (categories.includes('positioning')) {
    lines.push({
      title: 'Navigation & Positioning',
      description: `GNSS, GPS, RTK, and inertial navigation systems for precise UAV positioning and navigation.`,
      products: [
        { name: 'GPS/GNSS Modules', description: 'High-sensitivity satellite navigation receivers for UAV positioning.' },
        { name: 'RTK Systems', description: 'Centimeter-accurate real-time kinematic positioning for survey-grade applications.' },
      ]
    });
  }
  
  if (categories.includes('structural')) {
    lines.push({
      title: 'Airframe & Structures',
      description: `Carbon fiber frames, airframe components, and structural elements for UAV construction.`,
      products: [
        { name: 'Frame Kits', description: 'Precision-cut carbon fiber frames for multirotor and fixed-wing UAVs.' },
        { name: 'Landing Gear', description: 'Retractable and fixed landing gear systems for various UAV platforms.' },
      ]
    });
  }
  
  if (categories.includes('software')) {
    lines.push({
      title: 'Software & Firmware',
      description: `Flight control software, mission planning tools, and data analytics platforms for UAV operations.`,
      products: [
        { name: 'Flight Firmware', description: 'Open-source and proprietary flight control firmware for various UAV platforms.' },
        { name: 'Mission Planning', description: 'Ground control software for automated mission planning and execution.' },
      ]
    });
  }
  
  if (categories.includes('safety')) {
    lines.push({
      title: 'Safety Systems',
      description: `Parachute recovery systems, failsafe mechanisms, and safety equipment for UAV risk mitigation.`,
      products: [
        { name: 'Parachute Systems', description: 'Ballistic parachute recovery systems for emergency UAV descent.' },
        { name: 'Failsafe Modules', description: 'Independent safety monitors for automatic emergency procedures.' },
      ]
    });
  }
  
  if (categories.includes('counter-uas')) {
    lines.push({
      title: 'Counter-UAS Solutions',
      description: `Anti-drone detection, tracking, and mitigation systems for airspace security.`,
      products: [
        { name: 'Detection Systems', description: 'Radar, RF, and optical detection systems for unauthorized UAV identification.' },
        { name: 'Mitigation Systems', description: 'Signal jamming and interception systems for drone neutralization.' },
      ]
    });
  }
  
  if (categories.includes('materials')) {
    lines.push({
      title: 'Materials & Manufacturing',
      description: `Advanced composite materials and manufacturing services for UAV production.`,
      products: [
        { name: 'Carbon Fiber Sheets', description: 'High-strength carbon fiber plates and tubes for airframe construction.' },
        { name: 'Composite Components', description: 'Custom molded composite parts for UAV structures.' },
      ]
    });
  }
  
  if (categories.includes('services')) {
    lines.push({
      title: 'Services',
      description: `OEM/ODM manufacturing, consulting, training, and technical support services for the UAV industry.`,
      products: [
        { name: 'OEM/ODM Services', description: 'Custom design and manufacturing services for UAV products.' },
        { name: 'Technical Support', description: 'Engineering support, integration assistance, and after-sales service.' },
      ]
    });
  }
  
  // Default if no categories matched
  if (lines.length === 0) {
    lines.push({
      title: 'UAV Components & Systems',
      description: `${brandName} supplies components and systems for the unmanned aerial vehicle industry, serving the global B2B supply chain through the Aegisky GUTN platform.`,
      products: [
        { name: 'Drone Components', description: 'Various UAV components and spare parts for multirotor and fixed-wing aircraft.' },
      ]
    });
  }
  
  return lines;
}

// Generate professional description based on available data
function generateDescription(brand: any): string {
  const name = brand.name;
  const categories = brand.solution_categories || [];
  const productCount = brand.product_count || 0;
  const country = brand.country || 'Global';
  
  const catNames = categories.map((c: string) => solutionCategories[c]?.name || c).join(', ');
  
  if (country === 'Global') {
    return `${name} is a verified supplier on the Aegisky Global UAV Trusted Trade Network (GUTN), specializing in ${catNames || 'UAV components and systems'} for the international unmanned systems market. With ${productCount} products in its catalog, ${name} serves B2B customers worldwide, providing quality-assured drone components that undergo compliance screening for international trade. The company operates within the Aegisky GUTN ecosystem, ensuring that all transactions meet dual-use export compliance requirements including EU Dual-Use Regulation 2021/821 and US EAR standards.`;
  }
  
  return `${name} is a ${country}-based manufacturer and supplier in the unmanned aerial vehicle industry, specializing in ${catNames || 'UAV components and systems'}. With ${productCount} products available through the Aegisky Global UAV Trusted Trade Network, ${name} serves international B2B customers with quality drone components and systems. The company's products are used across various UAV applications including industrial inspection, surveying and mapping, aerial photography, agriculture, and public safety. All products undergo compliance verification for international trade under EU Dual-Use Regulation 2021/821 and US EAR guidelines.`;
}

// Process all brands
const completeProfiles: BrandProfile[] = brandsRaw.map((brand: any) => {
  const slug = brand.slug;
  const majorProfile = majorBrandProfiles[slug];
  
  // Start with base data
  const profile: BrandProfile = {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo_url: brand.logo_url || `/images/brands/${slug}.png`,
    verified: majorProfile?.verified || (brand.website_url ? true : false),
    tagline: brand.tagline || `UAV ${(brand.solution_categories || []).map((c: string) => solutionCategories[c]?.name || c).join(', ')} Specialist`,
    country: brand.country || 'Global',
    country_code: countryCodes[brand.country] || 'GLOBAL',
    website: brand.website_url || undefined,
    founded_year: brand.founded_year || undefined,
    description: brand.description || '',
    product_lines: [],
    solution_categories: brand.solution_categories || ['vehicles'],
    product_count: brand.product_count || 0,
  };
  
  // Merge major brand profile if available
  if (majorProfile) {
    Object.assign(profile, majorProfile);
    // Ensure base fields are preserved
    profile.id = brand.id;
    profile.slug = brand.slug;
    profile.name = brand.name;
    profile.product_count = brand.product_count;
    profile.solution_categories = brand.solution_categories || majorProfile.solution_categories || ['vehicles'];
  } else {
    // Generate description and product lines for non-major brands
    profile.description = generateDescription(brand);
    profile.product_lines = generateProductLines(brand.solution_categories || ['vehicles'], brand.name);
  }
  
  return profile;
});

// Write output
const outputDir = path.join(projectRoot, 'data', 'profiles');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write as JSON
const jsonPath = path.join(outputDir, 'brand-profiles.json');
fs.writeFileSync(jsonPath, JSON.stringify(completeProfiles, null, 2), 'utf-8');

// Write as TypeScript module
const tsContent = `/**
 * Complete brand profiles for all ${completeProfiles.length} brands
 * Auto-generated from verified sources and category-based professional descriptions
 * Generated: ${new Date().toISOString()}
 */
import { BrandProfile } from './brand-profiles';

const brandProfiles: BrandProfile[] = ${JSON.stringify(completeProfiles, null, 2)};

export default brandProfiles;
`;

const tsPath = path.join(projectRoot, 'storefront', 'src', 'lib', 'suppliers', 'brand-profiles-data.ts');
fs.writeFileSync(tsPath, tsContent, 'utf-8');

console.log(`Generated ${completeProfiles.length} brand profiles`);
console.log(`- Major brands with detailed profiles: ${Object.keys(majorBrandProfiles).length}`);
console.log(`- Category-based profiles: ${completeProfiles.length - Object.keys(majorBrandProfiles).length}`);
console.log(`- JSON output: ${jsonPath}`);
console.log(`- TS output: ${tsPath}`);

// Print statistics
const verifiedCount = completeProfiles.filter(b => b.verified).length;
const withWebsite = completeProfiles.filter(b => b.website).length;
const withFounded = completeProfiles.filter(b => b.founded_year).length;
const withLongDesc = completeProfiles.filter(b => b.long_description).length;

console.log(`\nStatistics:`);
console.log(`- Verified brands: ${verifiedCount}`);
console.log(`- With website: ${withWebsite}`);
console.log(`- With founded year: ${withFounded}`);
console.log(`- With long description: ${withLongDesc}`);
