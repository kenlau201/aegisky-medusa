/**
 * JSON-LD 结构化数据生成器
 * 遵循Schema.org标准，帮助AI和搜索引擎理解页面内容
 */

export interface ProductSchemaInput {
  id: string;
  title: string;
  description?: string;
  mpn?: string;
  sku?: string;
  brand?: {
    name: string;
    url?: string;
  };
  manufacturer?: {
    id: string;
    name: string;
    url?: string;
  };
  category?: string;
  images?: string[];
  price?: number;
  priceCurrency?: string;
  moq?: number;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  specs?: Array<{ name: string; value: string; unit?: string }>;
  applicationAreas?: string[];
  certifications?: string[];
  url: string;
}

export interface OrganizationSchemaInput {
  id: string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  country?: string;
  certifications?: string[];
  foundingYear?: number;
  employeeCount?: number;
}

export interface CollectionPageSchemaInput {
  name: string;
  description?: string;
  url: string;
  numberOfItems?: number;
  image?: string;
}

export interface FAQSchemaInput {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export interface BreadcrumbSchemaInput {
  items: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * 生成产品页JSON-LD
 */
export function generateProductSchema(product: ProductSchemaInput): object {
  const additionalProperty = product.specs?.map(spec => ({
    '@type': 'PropertyValue',
    name: spec.name,
    value: spec.value,
    ...(spec.unit && { unitCode: spec.unit }),
  })) || [];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': product.url + '#product',
    name: product.title,
    description: product.description,
    url: product.url,
    mpn: product.mpn,
    sku: product.sku,
    image: product.images,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand.name,
      ...(product.brand.url && { url: product.brand.url }),
    } : undefined,
    manufacturer: product.manufacturer ? {
      '@type': 'Organization',
      '@id': product.manufacturer.url || `https://aegisky.com/supplier/${product.manufacturer.id}`,
      name: product.manufacturer.name,
    } : undefined,
    category: product.category,
    additionalProperty,
    ...(product.applicationAreas && {
      applicationCategory: product.applicationAreas,
    }),
    offers: product.price ? {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.priceCurrency || 'USD',
      price: product.price,
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      ...(product.moq && {
        eligibleQuantity: {
          '@type': 'QuantitativeValue',
          minValue: product.moq,
        },
      }),
      businessFunction: 'http://purl.org/goodrelations/v1#Manufacture',
      seller: {
        '@type': 'Organization',
        name: 'Aegisky',
        url: 'https://aegisky.com',
      },
    } : undefined,
  };
}

/**
 * 生成供应商/组织JSON-LD
 */
export function generateOrganizationSchema(org: OrganizationSchemaInput): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': org.url + '#organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    description: org.description,
    location: org.country ? {
      '@type': 'Country',
      name: org.country,
    } : undefined,
    foundingDate: org.foundingYear ? `${org.foundingYear}` : undefined,
    numberOfEmployees: org.employeeCount ? {
      '@type': 'QuantitativeValue',
      value: org.employeeCount,
    } : undefined,
    hasCredential: org.certifications?.map(cert => ({
      '@type': 'EducationalOccupationalCredential',
      name: cert,
    })),
  };
}

/**
 * 生成分类/集合页JSON-LD
 */
export function generateCollectionPageSchema(collection: CollectionPageSchemaInput): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description,
    url: collection.url,
    image: collection.image,
    numberOfItems: collection.numberOfItems,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Aegisky',
      url: 'https://aegisky.com',
    },
  };
}

/**
 * 生成FAQ页JSON-LD
 */
export function generateFAQSchema(faq: FAQSchemaInput): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

/**
 * 生成面包屑JSON-LD
 */
export function generateBreadcrumbSchema(breadcrumb: BreadcrumbSchemaInput): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * 生成网站搜索JSON-LD
 */
export function generateWebSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Aegisky',
    url: 'https://aegisky.com',
    description: 'Global UAV Trusted Trade Network - B2B marketplace for industrial drones',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://aegisky.com/en/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * 组合多个Schema为一个数组
 */
export function combineSchemas(...schemas: (object | undefined | null)[]): object[] {
  return schemas.filter(Boolean) as object[];
}
