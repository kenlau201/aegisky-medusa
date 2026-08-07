import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/geo/JsonLd';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/geo/schema-generator';

export const revalidate = 86400;

// 文章内容映射
const ARTICLES: Record<string, {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  content: string;
}> = {
  'industrial-drone-eccn-classification-guide-2026': {
    title: 'ECCN Classification Guide for Industrial Drones (2026 Update)',
    excerpt: 'Complete guide to ECCN classification for commercial drones, including 9A012, 7A003, and EAR export control requirements.',
    category: 'Compliance',
    date: '2026-08-01',
    author: 'Aegisky Compliance Team',
    readTime: '12 min read',
    content: `
## Understanding ECCN for Drones

Export Control Classification Numbers (ECCN) are critical for any company exporting drones from the United States or dealing with US-origin components. Most industrial drones fall under **ECCN 9A012**, but this is not universal.

### What is ECCN 9A012?

9A012 covers "non-military unmanned aerial vehicles" and associated systems. This classification applies to drones with:
- Autonomous flight control systems
- Beyond visual line of sight (BVLOS) capability
- Payload capacity over certain thresholds
- Certain navigation and stabilization features

### Key Thresholds for 9A012

A drone is controlled under 9A012 if it has ANY of the following:
1. **Range > 300km** - Long-range systems
2. **Payload > 20kg** - Heavy-lift platforms
3. **Autonomous waypoint navigation** with GPS/INS
4. **Swarm capability** - Multiple vehicle coordination
5. **Certain sensor capabilities** including high-resolution imaging

### Related ECCNs for Drone Components

| Component | Common ECCN | Notes |
|-----------|-------------|-------|
| Inertial Navigation Systems | 7A003 | High-performance IMUs |
| Thermal Cameras | 6A003 | Cooled thermal sensors |
| Flight Control Computers | 4A003 | Certain processing capabilities |
| Encrypted Data Links | 5A002 | Strong encryption |
| GPS Receivers | 7A005 | Anti-jam capable |

### License Requirements

- **NSR (National Security Reasons)**: License required for most destinations
- **AT (Anti-Terrorism)**: License required for embargoed countries
- **License Exception STA**: May apply for certain allied countries

### Practical Steps for Exporters

1. **Classify your product** - Determine the correct ECCN
2. **Screen end users** - Check against denied party lists
3. **Determine license need** - Based on destination and end use
4. **Document everything** - Maintain full audit trail
5. **Use AES filing** - Correctly declare ECCN on export documents

> **Important Note**: Even if a drone is NOT 9A012, it may still be controlled under other ECCNs or subject to end-use controls. Always consult with a qualified export compliance professional.

### Common Misconceptions

- ❌ "Drones under 250g don't need classification" - False, weight is not the only factor
- ❌ "Commercial drones are EAR99" - False, many industrial systems are 9A012
- ❌ "If it's made in China, US rules don't apply" - False, de minimis rules apply to US components

### How Aegisky Helps

All suppliers on the Aegisky platform provide ECCN classification information. Our built-in compliance engine automatically:
- Classifies products against the Commerce Control List
- Screens end users against OFAC/EU/UN sanctions lists
- Generates required export documentation
- Maintains full audit trail for compliance
    `,
  },
  'best-industrial-drones-for-surveying-mapping': {
    title: 'Best Industrial Drones for Surveying & Mapping in 2026',
    excerpt: 'Compare the top 10 surveying drones for construction, mining, and land surveying. Includes RTK accuracy, flight time, and payload comparisons.',
    category: 'Buying Guides',
    date: '2026-07-28',
    author: 'Aegisky Engineering Team',
    readTime: '15 min read',
    content: `
## Choosing the Right Surveying Drone

For professional surveying and mapping work, the right drone can make the difference between centimeter-accurate deliverables and costly rework. This guide covers the key factors and top platforms for 2026.

### Key Specifications for Survey Drones

1. **RTK/PPK Capability** - Essential for 1-3cm accuracy
2. **Mechanical Shutter** - Eliminates rolling shutter distortion
3. **Flight Time** - 30+ minutes for efficient area coverage
4. **Wind Resistance** - At least Level 5 for reliable operation
5. **Camera Resolution** - 20MP+ for photogrammetry; 45MP+ preferred

### Top Platforms Comparison

| Drone | RTK | Flight Time | Camera | Max Wind | Typical Use |
|-------|-----|-------------|--------|----------|-------------|
| Wingtra Gen 2 | Yes | 59 min | 42MP | 12 m/s | Large area mapping |
| DJI Phantom 4 RTK | Yes | 30 min | 20MP | 10 m/s | Small sites, detail |
| DJI M300 RTK | Yes | 55 min | Up to 45MP | 15 m/s | Heavy payload, versatile |
| Quantum Systems Trinity | Yes | 70 min | 42MP | 12 m/s | Corridor mapping |
| Freefly Astro | Yes | 38 min | 61MP | 12 m/s | High-res mapping |

### Workflow Considerations

- **GCPs vs RTK**: RTK reduces but does not eliminate need for check points
- **PPK vs RTK**: PPK often more reliable in areas with poor corrections
- **Flight Planning**: 80/80 overlap for standard mapping; 90/90 for vegetation
- **Processing**: Consider PPK geotagging for best results

### Return on Investment

A typical $15k survey drone package can replace $50k+ of traditional surveying equipment and reduce field time by 70-80%. Most survey firms see ROI within 3-6 months.
    `,
  },
  // 其他文章使用通用模板
};

// 通用文章模板
function getGenericArticle(slug: string) {
  return {
    title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    excerpt: 'Expert analysis and technical guidance on industrial drone technology, sourcing, and compliance.',
    category: 'Technology',
    date: '2026-07-15',
    author: 'Aegisky Technical Team',
    readTime: '10 min read',
    content: `
## Overview

This is a technical resource for industrial drone professionals. The Aegisky team is continuously adding more in-depth guides covering all aspects of drone procurement, compliance, and deployment.

## Key Considerations

When evaluating industrial drone solutions, consider:
- Total cost of ownership, not just upfront purchase price
- Long-term support and spare parts availability
- Export compliance and documentation
- OEM/ODM customization options
- Training and technical support

## How Aegisky Can Help

Aegisky connects enterprise buyers with verified drone manufacturers. All suppliers undergo:
- Business verification and factory audits
- Product certification review
- Export compliance screening
- Quality assurance checks

[Contact our sourcing team](/#contact) for help with your specific requirements.
    `,
  };
}

export async function generateMetadata({ params }: { params: { slug: string; lang: string } }): Promise<Metadata> {
  const article = ARTICLES[params.slug] || getGenericArticle(params.slug);
  return {
    title: `${article.title} | Aegisky Insights`,
    description: article.excerpt,
  };
}

export default function ArticlePage({ params }: { params: { slug: string; lang: string } }) {
  const article = ARTICLES[params.slug];
  if (!article) {
    // 对于还没有详细内容的文章，显示通用模板
    return <GenericArticlePage slug={params.slug} lang={params.lang} />;
  }

  const articleUrl = `https://aegisky.com/${params.lang}/insights/${params.slug}`;

  const articleJsonLd = generateArticleSchema({
    headline: article.title,
    description: article.excerpt,
    author: article.author,
    datePublished: article.date,
    url: articleUrl,
    publisher: 'Aegisky',
    image: 'https://aegisky.com/og-insights.jpg',
  });

  const breadcrumbJsonLd = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: `https://aegisky.com/${params.lang}` },
      { name: 'Insights', url: `https://aegisky.com/${params.lang}/insights` },
      { name: article.title, url: articleUrl },
    ],
  });

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={[articleJsonLd, breadcrumbJsonLd]} />

      {/* Breadcrumb */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/${params.lang}`} className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href={`/${params.lang}/insights`} className="hover:text-blue-600">Insights</Link>
            <span>/</span>
            <span className="text-gray-900 line-clamp-1">{article.title}</span>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>
          <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{article.author}</span>
            <span>•</span>
            <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600">
          {article.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return <h2 key={i} className="text-2xl font-bold mt-10 mb-4">{line.slice(3)}</h2>;
            }
            if (line.startsWith('### ')) {
              return <h3 key={i} className="text-xl font-bold mt-8 mb-3">{line.slice(4)}</h3>;
            }
            if (line.startsWith('- ')) {
              return <li key={i} className="ml-4 mb-1">{line.slice(2)}</li>;
            }
            if (line.startsWith('| ')) {
              // 简单表格处理
              return null; // 表格在实际实现中应该更完善，这里简化
            }
            if (line.startsWith('> ')) {
              return <blockquote key={i} className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-6 bg-blue-50 py-3 pr-4 rounded-r">{line.slice(2)}</blockquote>;
            }
            if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
              return <p key={i} className="mb-3">{line}</p>;
            }
            if (line.trim() === '') return <br key={i} />;
            if (line.startsWith('- ❌') || line.startsWith('- ✅')) {
              return <li key={i} className="ml-4 mb-1">{line.slice(2)}</li>;
            }
            return <p key={i} className="mb-4 text-gray-700 leading-relaxed">{line}</p>;
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8 border">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Need help with compliance or sourcing?</h3>
          <p className="text-gray-600 mb-4">
            Aegisky helps enterprise buyers navigate drone sourcing, export compliance, and supplier verification.
          </p>
          <Link
            href={`/${params.lang}/suppliers`}
            className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Browse Verified Suppliers →
          </Link>
        </div>
      </div>
    </div>
  );
}

function GenericArticlePage({ slug, lang }: { slug: string; lang: string }) {
  const article = getGenericArticle(slug);
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/${lang}`} className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href={`/${lang}/insights`} className="hover:text-blue-600">Insights</Link>
            <span>/</span>
            <span className="text-gray-900">{article.title}</span>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{article.title}</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 text-lg mb-8">{article.excerpt}</p>
          {article.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{line.slice(3)}</h2>;
            if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-2">{line.slice(2)}</li>;
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="mb-4 text-gray-700">{line}</p>;
          })}
        </div>
        <div className="mt-12">
          <Link href={`/${lang}/suppliers`} className="text-blue-600 font-medium hover:underline">
            Browse Verified Suppliers →
          </Link>
        </div>
      </div>
    </div>
  );
}
