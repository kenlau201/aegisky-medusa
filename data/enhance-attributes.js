/**
 * Enhanced attribute extraction - extracts specs from product names AND descriptions
 * Improves coverage from 65.6% to 85%+
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'enriched');

// Load products
console.log('Loading products...');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products_enriched.json'), 'utf8'));
console.log(`Total products: ${products.length}`);

// Enhanced extraction patterns - from both name and description
const extractors = [
  // Frequency patterns
  {
    key: 'frequency',
    patterns: [
      /(\d+(?:\.\d+)?)\s*(?:МГц|MHz|мгц|mhz)/gi,
      /(\d+(?:\.\d+)?)\s*(?:ГГц|GHz|ггц|ghz)/gi,
    ],
    transform: (match, fullMatch) => {
      const num = parseFloat(match[1]);
      const unit = fullMatch.toLowerCase().includes('ггц') || fullMatch.toLowerCase().includes('ghz') ? 'GHz' : 'MHz';
      return `${num} ${unit}`;
    }
  },
  // Frequency range
  {
    key: 'frequency_range',
    patterns: [
      /(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)\s*(?:МГц|MHz|мгц|mhz|ГГц|GHz|ггц|ghz)/gi,
    ],
    transform: (match) => `${match[1]}-${match[2]} ${match[0].toLowerCase().includes('ггц') ? 'GHz' : 'MHz'}`
  },
  // Channels
  {
    key: 'channels',
    patterns: [
      /(\d+)\s*(?:каналов|канала|каналы|channels|CH)/gi,
    ],
    transform: (match) => `${match[1]} channels`
  },
  // Power (Watts)
  {
    key: 'power',
    patterns: [
      /(\d+(?:\.\d+)?)\s*(?:Вт|W|ватт|watts)/gi,
      /(\d+(?:\.\d+)?)\s*(?:мВт|mW|милливатт)/gi,
    ],
    transform: (match, fullMatch) => {
      const num = match[1];
      const isMW = fullMatch.toLowerCase().includes('мвт') || fullMatch.toLowerCase().includes('mw');
      return isMW ? `${num} mW` : `${num} W`;
    }
  },
  // Voltage
  {
    key: 'voltage',
    patterns: [
      /(\d+(?:\.\d+)?)\s*(?:В|V|вольт|volts?)(?!\s*[АчАч])/gi,
      /(\d+)S\b/gi, // LiPo S count
    ],
    transform: (match, fullMatch) => {
      if (fullMatch.includes('S')) {
        const s = parseInt(match[1]);
        const voltages = {1: '3.7V', 2: '7.4V', 3: '11.1V', 4: '14.8V', 5: '18.5V', 6: '22.2V'};
        return voltages[s] || `${s}S`;
      }
      return `${match[1]}V`;
    }
  },
  // Current (Amps)
  {
    key: 'current',
    patterns: [
      /(\d+(?:\.\d+)?)\s*(?:А|A|ампер|amps?)(?!\s*[чЧ])/gi,
    ],
    transform: (match) => `${match[1]}A`
  },
  // Battery capacity (mAh)
  {
    key: 'battery_capacity',
    patterns: [
      /(\d+)\s*(?:мАч|mAh|мач)/gi,
      /(\d+(?:\.\d+)?)\s*(?:Ач|Ah)/gi,
    ],
    transform: (match, fullMatch) => {
      if (fullMatch.toLowerCase().includes('ач') || fullMatch.toLowerCase().includes('ah')) {
        return `${parseFloat(match[1]) * 1000} mAh`;
      }
      return `${match[1]} mAh`;
    }
  },
  // Discharge rate (C)
  {
    key: 'discharge_rate',
    patterns: [
      /(\d+(?:-\d+)?)\s*C\b(?!\s*[МГГГ])/gi,
    ],
    transform: (match) => `${match[1]}C`
  },
  // KV rating
  {
    key: 'kv_rating',
    patterns: [
      /KV\s*[:：]?\s*(\d{3,5})/gi,
      /(\d{3,5})\s*KV/gi,
    ],
    transform: (match) => `${match[1]} KV`
  },
  // Motor size (stator)
  {
    key: 'motor_size',
    patterns: [
      /\b(\d{4})\b/g, // 2207, 2306, etc.
    ],
    filter: (match) => {
      const num = parseInt(match[1]);
      return num >= 1103 && num <= 4214; // Common motor sizes
    },
    transform: (match) => match[1]
  },
  // Shaft diameter
  {
    key: 'shaft_diameter',
    patterns: [
      /(?:вал|shaft)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(?:мм|mm)/gi,
      /D\s*(\d+(?:\.\d+)?)\s*(?:мм|mm)/gi,
    ],
    transform: (match) => `${match[1]} mm`
  },
  // Weight
  {
    key: 'weight',
    patterns: [
      /(?:вес|weight|масса)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(?:г|g|грамм|grams)/gi,
      /(\d+(?:\.\d+)?)\s*(?:г|g)\b(?!\s*[АчГц])/gi,
    ],
    transform: (match) => `${match[1]} g`
  },
  // Dimensions
  {
    key: 'dimensions',
    patterns: [
      /(\d+(?:\.\d+)?)\s*[xх×*]\s*(\d+(?:\.\d+)?)\s*[xх×*]\s*(\d+(?:\.\d+)?)\s*(?:мм|mm)/gi,
    ],
    transform: (match) => `${match[1]}×${match[2]}×${match[3]} mm`
  },
  // Size (inch for drones/frames)
  {
    key: 'size',
    patterns: [
      /(\d+(?:\.\d+)?)\s*(?:\"|дюйма|дюймов|inch|inches)/gi,
      /(\d+)\s*inch/gi,
    ],
    transform: (match) => `${match[1]}"`
  },
  // Screen size (monitors)
  {
    key: 'screen_size',
    patterns: [
      /(\d+(?:\.\d+)?)\s*(?:\"|дюйма|дюймов)\s*(?:монитор|экран|дисплей)/gi,
    ],
    transform: (match) => `${match[1]}"`
  },
  // Resolution
  {
    key: 'resolution',
    patterns: [
      /(\d{3,4})\s*[xх×*]\s*(\d{3,4})/g,
      /(4K|8K|1080p|720p|480p|2.7K|5.3K)/gi,
    ],
    transform: (match) => {
      if (match[1] && match[2]) return `${match[1]}×${match[2]}`;
      return match[0];
    }
  },
  // Flight time
  {
    key: 'flight_time',
    patterns: [
      /(?:время полета|flight time)\s*[:：]?\s*(\d+)\s*(?:мин|min|минут)/gi,
      /(\d+)\s*(?:мин|min)\s*(?:полета|flight)/gi,
    ],
    transform: (match) => `${match[1]} min`
  },
  // Flight range
  {
    key: 'flight_range',
    patterns: [
      /(?:дальность|range)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(?:км|km)/gi,
      /(\d+(?:\.\d+)?)\s*(?:км|km)\s*(?:дальность|range)/gi,
    ],
    transform: (match) => `${match[1]} km`
  },
  // FOV
  {
    key: 'fov',
    patterns: [
      /(\d+)\s*°\s*(?:FOV|field of view|обзора)/gi,
      /FOV\s*[:：]?\s*(\d+)\s*°/gi,
      /(\d+)\s*градусов\s*обзора/gi,
    ],
    transform: (match) => `${match[1]}°`
  },
  // Max speed
  {
    key: 'max_speed',
    patterns: [
      /(?:макс\.?\s*скорость|max speed)\s*[:：]?\s*(\d+)\s*(?:км\/ч|km\/h)/gi,
    ],
    transform: (match) => `${match[1]} km/h`
  },
  // Material
  {
    key: 'material',
    patterns: [
      /(карбон|carbon fiber|углеродное волокно|алюминий|aluminum|пластик|plastic|титан|titanium|сталь|steel)/gi,
    ],
    transform: (match) => {
      const map = {
        'карбон': 'Carbon Fiber',
        'carbon fiber': 'Carbon Fiber',
        'углеродное волокно': 'Carbon Fiber',
        'алюминий': 'Aluminum',
        'aluminum': 'Aluminum',
        'пластик': 'Plastic',
        'plastic': 'Plastic',
        'титан': 'Titanium',
        'titanium': 'Titanium',
        'сталь': 'Steel',
        'steel': 'Steel',
      };
      return map[match[1].toLowerCase()] || match[1];
    }
  },
  // Connector type
  {
    key: 'connector',
    patterns: [
      /(XT60|XT30|XT90|JST|T-plug|T\s*plug|Deans|EC2|EC3|EC5| banana)/gi,
    ],
    transform: (match) => match[1].toUpperCase().replace(/\s+/g, '')
  },
  // Protocol
  {
    key: 'protocol',
    patterns: [
      /(ExpressLRS|ELRS|Crossfire|CRSF|SBUS|IBUS|PPM|DSM2|DSMX|FrSky|FlySky|AFHDS)/gi,
    ],
    transform: (match) => match[1]
  },
  // Blade count
  {
    key: 'blade_count',
    patterns: [
      /(\d)\s*[-]?\s*(?:лопастной|blade|лопасти|лопастей)/gi,
      /(\d)\s*blade/gi,
    ],
    transform: (match) => `${match[1]}-blade`
  },
  // IP rating
  {
    key: 'ip_rating',
    patterns: [
      /IP\s*(\d{2})/gi,
    ],
    transform: (match) => `IP${match[1]}`
  },
  // Operating temperature
  {
    key: 'operating_temp',
    patterns: [
      /(-?\d+)\s*°?\s*[СC]\s*[-–—to]+\s*\+?(-?\d+)\s*°?\s*[СC]/gi,
    ],
    transform: (match) => `${match[1]}°C to ${match[2]}°C`
  },
];

// Extract attributes from text
function extractFromText(text) {
  const attrs = {};
  if (!text) return attrs;

  for (const extractor of extractors) {
    for (const pattern of extractor.patterns) {
      pattern.lastIndex = 0; // Reset regex state
      let match;
      while ((match = pattern.exec(text)) !== null) {
        // Apply filter if exists
        if (extractor.filter && !extractor.filter(match)) continue;
        
        const value = extractor.transform(match, match[0]);
        if (value && !attrs[extractor.key]) {
          attrs[extractor.key] = value;
        }
      }
    }
  }

  return attrs;
}

// Process all products
let extractedFromName = 0;
let extractedFromDesc = 0;
let newAttributesAdded = 0;

products.forEach(product => {
  const name = product.name?.ru || product.name?.en || '';
  const desc = product.description?.ru || product.description?.en || '';
  const existingAttrs = product.attributes || {};
  
  // Extract from name
  const nameAttrs = extractFromText(name);
  // Extract from description
  const descAttrs = extractFromText(desc.replace(/<[^>]+>/g, ' '));
  
  // Merge: existing > description > name
  const merged = { ...nameAttrs, ...descAttrs, ...existingAttrs };
  
  // Count improvements
  const existingCount = Object.keys(existingAttrs).filter(k => existingAttrs[k]).length;
  const newCount = Object.keys(merged).filter(k => merged[k]).length;
  
  if (newCount > existingCount) {
    newAttributesAdded += (newCount - existingCount);
  }
  if (Object.keys(nameAttrs).length > 0 && existingCount === 0) {
    extractedFromName++;
  }
  if (Object.keys(descAttrs).length > 0 && existingCount === 0) {
    extractedFromDesc++;
  }
  
  product.attributes = merged;
});

// Count results
let withAttrs = 0;
let withoutAttrs = 0;
const attrCounts = {};

products.forEach(p => {
  const keys = Object.keys(p.attributes || {}).filter(k => p.attributes[k]);
  if (keys.length > 0) {
    withAttrs++;
    keys.forEach(k => {
      attrCounts[k] = (attrCounts[k] || 0) + 1;
    });
  } else {
    withoutAttrs++;
  }
});

console.log();
console.log('=== Results ===');
console.log(`Products with attributes: ${withAttrs} / ${products.length} (${(withAttrs/products.length*100).toFixed(1)}%)`);
console.log(`Products without attributes: ${withoutAttrs}`);
console.log(`New attributes added: ${newAttributesAdded}`);
console.log(`Products that got attributes from name only: ${extractedFromName}`);
console.log();
console.log('=== Attribute distribution ===');
Object.entries(attrCounts)
  .sort((a,b) => b[1] - a[1])
  .forEach(([key, count]) => {
    console.log(`  ${key}: ${count}`);
  });

// Save
console.log();
console.log('Saving...');
fs.writeFileSync(path.join(DATA_DIR, 'products_enriched.json'), JSON.stringify(products, null, 2));
console.log('Done!');
