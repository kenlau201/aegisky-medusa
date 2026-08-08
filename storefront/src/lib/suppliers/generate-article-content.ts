import { pool as db } from '../control-tower/db';

// Content generation templates based on article category and brand
function generateProductContent(article: any, brand: any): string {
  const brandName = brand.brand_name || brand.name || 'the manufacturer';
  const productName = article.title.replace(/^.*?:\s*/, '').replace(/\s*[-–—]\s*.*$/, '').trim();
  const year = new Date().getFullYear();

  return `## Overview

${article.summary || `${brandName} announces ${productName}, expanding their portfolio of professional UAV and FPV solutions.`}

This release represents ${brandName}'s continued commitment to innovation in the unmanned systems industry, bringing new capabilities to pilots, integrators, and enterprise users worldwide.

## Key Features and Specifications

${productName} incorporates several notable design elements that set it apart in its category:

- **Advanced Engineering**: Built with precision manufacturing and rigorous quality control standards that ${brandName} is known for
- **Performance Optimized**: Tuned for the specific demands of modern multirotor and fixed-wing UAV platforms
- **Reliability**: Designed for consistent performance across a wide range of operating conditions and temperatures
- **Compatibility**: Works with standard flight controllers, ESCs, and peripherals commonly used in the industry

## Technical Details

The product has been engineered to meet the needs of both professional users and hobbyists, with attention to:

- Power efficiency and thermal management
- Durability under vibration and stress
- Ease of installation and configuration
- Long-term availability and support

## Applications

${productName} is suitable for a range of applications including:

- FPV racing and freestyle flying
- Cinematic and aerial photography
- Long-range and exploration missions
- Industrial inspection and mapping
- Research and development platforms

## About ${brandName}

${brand.description || `${brandName} is a recognized manufacturer in the UAV and FPV industry, producing components and complete systems used by pilots and organizations worldwide.`}

${brand.country ? `Headquartered in ${brand.country}, ` : ''}${brandName} serves a global customer base through authorized distributors and direct sales channels.

## Availability and Support

${productName} is available through ${brandName}'s authorized dealer network and online store. For bulk orders, OEM customization, or distribution inquiries, contact ${brandName} directly or visit their profile on the Aegisky platform.

> **Note**: Specifications and availability are subject to change. Always refer to the manufacturer's official documentation for the most current information.
`;
}

function generateNewsContent(article: any, brand: any): string {
  const brandName = brand.brand_name || brand.name || 'the manufacturer';

  return `## Summary

${article.summary || `${brandName} has made a significant announcement that impacts the UAV and unmanned systems industry.`}

This development reflects the ongoing evolution of the drone industry and ${brandName}'s position within it.

## What This Means

For professionals and organizations operating in the unmanned systems space, this announcement signals several important developments:

- **Industry Direction**: The continued investment in drone technology by established manufacturers indicates growing market confidence
- **Technology Advancement**: New products and capabilities push the boundaries of what UAV systems can achieve
- **Market Expansion**: As more use cases emerge, the addressable market for drone solutions continues to grow
- **Competition and Innovation**: Announcements from major players drive competition and accelerate innovation across the sector

## Context and Background

${brandName} has been active in the UAV industry, developing products that serve both consumer and professional markets. This latest move builds on their existing portfolio and expertise.

The broader drone industry continues to see rapid growth, with applications spanning agriculture, inspection, mapping, delivery, public safety, and defense. Regulatory frameworks around the world are also evolving to accommodate the increasing use of unmanned systems.

## Industry Implications

This development is likely to have several effects:

1. Other manufacturers may respond with competing or complementary offerings
2. End users benefit from expanded choices and improved capabilities
3. The overall ecosystem of compatible components and systems grows
4. Investment and interest in the sector continue to strengthen

## Looking Ahead

As the unmanned systems industry matures, expect to see continued announcements from ${brandName} and other leading manufacturers. Key trends to watch include:

- Increased autonomy and AI integration
- Longer flight times and improved battery technology
- Enhanced sensor capabilities and data processing
- Greater integration with airspace management systems
- Expanded commercial applications and use cases

## Learn More

For the most accurate and up-to-date information, refer to ${brandName}'s official communications and product documentation.

> **Disclaimer**: This article is for informational purposes only and does not constitute an endorsement or recommendation. Always verify specifications and availability directly with the manufacturer.
`;
}

function generateGenericContent(article: any, brand: any): string {
  const brandName = brand.brand_name || brand.name || 'the manufacturer';

  return `## Overview

${article.summary || `This article covers developments related to ${brandName} and their contributions to the unmanned systems industry.`}

${brandName} continues to be active in the UAV and FPV space, providing products and solutions that serve a diverse range of users from hobbyists to enterprise operators.

## Background

The unmanned systems industry has experienced significant growth in recent years, driven by advances in battery technology, miniaturized sensors, and autonomous flight capabilities. Manufacturers like ${brandName} play an important role in this ecosystem by developing specialized components and complete systems.

${brand.country ? `Based in ${brand.country}, ` : ''}${brandName} has established a presence in the global drone supply chain, with products distributed through multiple channels worldwide.

## Key Considerations

When evaluating products from ${brandName} or any UAV component manufacturer, consider the following factors:

- **Compatibility**: Ensure the product works with your existing flight controller, ESC, receiver, and other components
- **Support and Documentation**: Check for available documentation, firmware updates, and technical support
- **Quality and Reliability**: Look for reviews and feedback from other users in the community
- **Regulatory Compliance**: Be aware of any export control or certification requirements for your region
- **Total Cost of Ownership**: Consider not just the purchase price, but also longevity, spare parts availability, and upgrade paths

## The Aegisky Platform

Aegisky's Global UAV Trusted Trade Network connects buyers with verified suppliers in the drone industry. All suppliers on the platform undergo verification, and products are categorized to help buyers find the right components for their specific needs.

For enterprise buyers, Aegisky offers additional services including compliance screening, bulk order management, and logistics support for cross-border transactions.

## Related Resources

- Explore ${brandName}'s full product catalog on their supplier profile
- Browse other verified suppliers in the same category
- Review compliance and export control guidance for UAV components
- Connect with Aegisky's sourcing team for personalized assistance

> **Note**: The information in this article is based on publicly available information and industry knowledge. For product-specific questions, contact the manufacturer directly.
`;
}

function calculateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(3, Math.round(words / 200));
  return `${minutes} min read`;
}

async function generateAllContent() {
  // Get all articles with brand info
  const result = await db.query(`
    SELECT a.id, a.title, a.summary, a.category, a.url, a.source,
           b.id as brand_id, b.name as brand_name, b.slug as brand_slug,
           b.description, b.country, b.product_count
    FROM brand_articles a
    JOIN aegisky_brands b ON a.brand_id = b.id
    ORDER BY a.id
  `);

  console.log(`Generating content for ${result.rows.length} articles...`);

  let updated = 0;
  for (const article of result.rows) {
    let content: string;
    const category = (article.category || '').toLowerCase();

    if (category === 'product') {
      content = generateProductContent(article, article);
    } else if (category === 'news') {
      content = generateNewsContent(article, article);
    } else {
      content = generateGenericContent(article, article);
    }

    const readTime = calculateReadTime(content);

    await db.query(
      `UPDATE brand_articles SET content = $1, read_time = $2 WHERE id = $3`,
      [content, readTime, article.id]
    );
    updated++;

    if (updated % 50 === 0) {
      console.log(`  Progress: ${updated}/${result.rows.length}`);
    }
  }

  // Verify
  const withContent = await db.query(`SELECT COUNT(*) FROM brand_articles WHERE content IS NOT NULL AND content != ''`);
  console.log(`\n=== Content Generation Complete ===`);
  console.log(`Articles updated: ${updated}`);
  console.log(`Total articles with content: ${withContent.rows[0].count}`);

  await db.end();
}

generateAllContent().catch(console.error);
