/**
 * GEO Article Value Scoring Engine
 *
 * Scores articles based on their value for Generative Engine Optimization (GEO).
 * Higher scores = more likely to be cited by AI search engines (ChatGPT, Perplexity, Gemini, etc.)
 *
 * Scoring dimensions (0-100 total):
 * 1. Content Depth (0-25): Word count, structure, comprehensiveness
 * 2. Keyword Relevance (0-20): B2B buyer keywords, product terms, industry jargon
 * 3. Freshness Decay (0-15): Recency with time-based decay
 * 4. Search Intent Match (0-15): How well it answers buyer questions
 * 5. Brand/Product Authority (0-15): Mentions of specific products, specs, use cases
 * 6. Structural Quality (0-10): Headings, lists, tables, citations
 */

// B2B buyer keywords that AI search engines and human buyers search for
const B2B_KEYWORDS = [
  // Product/spec terms
  'specification', 'specs', 'datasheet', 'features', 'performance', 'payload', 'flight time',
  'range', 'endurance', 'weight', 'dimension', 'battery', 'motor', 'propeller', 'camera',
  'sensor', 'gimbal', 'lidar', 'thermal', 'rtk', 'gps', 'autopilot', 'flight controller',
  // Commercial terms
  'price', 'cost', 'buy', 'wholesale', 'bulk', 'oem', 'odm', 'manufacturer', 'supplier',
  'distributor', 'dealer', 'quote', 'rfq', 'moq', 'lead time', 'warranty', 'certification',
  // Use cases
  'inspection', 'surveying', 'mapping', 'agriculture', 'delivery', 'security', 'defense',
  'public safety', 'construction', 'mining', 'oil and gas', 'infrastructure', 'emergency',
  // Compliance
  'eccn', 'export control', 'compliance', 'ce', 'fcc', 'iso', 'certification', 'dual-use',
  // Comparison/decision
  'vs', 'comparison', 'review', 'best', 'top', 'alternative', 'guide', 'how to', 'tutorial',
  // Industry terms
  'uav', 'drone', 'uas', 'unmanned', 'multirotor', 'fixed-wing', 'vtol', 'fpv', 'quadcopter',
];

// Search intent categories
type SearchIntent = 'product' | 'news' | 'guide' | 'comparison' | 'specification' | 'compliance' | 'generic';

function detectSearchIntent(title: string, summary: string, category: string): SearchIntent {
  const text = `${title} ${summary}`.toLowerCase();
  if (category === 'product') return 'product';
  if (category === 'news') return 'news';
  if (text.includes('vs ') || text.includes('comparison') || text.includes('compared')) return 'comparison';
  if (text.includes('how to') || text.includes('guide') || text.includes('tutorial')) return 'guide';
  if (text.includes('spec') || text.includes('datasheet') || text.includes('specification')) return 'specification';
  if (text.includes('eccn') || text.includes('compliance') || text.includes('export') || text.includes('certification')) return 'compliance';
  return 'generic';
}

// Intent weights for GEO (guides and comparisons are most cited by AI)
const INTENT_WEIGHTS: Record<SearchIntent, number> = {
  guide: 15,
  comparison: 14,
  specification: 13,
  compliance: 12,
  product: 10,
  news: 6,
  generic: 5,
};

function scoreContentDepth(content: string): number {
  if (!content) return 0;
  const words = content.split(/\s+/).length;
  let score = 0;

  // Word count scoring (0-15)
  if (words >= 1500) score += 15;
  else if (words >= 1000) score += 12;
  else if (words >= 600) score += 9;
  else if (words >= 400) score += 6;
  else if (words >= 200) score += 3;

  // Structure bonus (0-10)
  const h2Count = (content.match(/^## /gm) || []).length;
  const h3Count = (content.match(/^### /gm) || []).length;
  const listCount = (content.match(/^- /gm) || []).length;
  const tableRows = (content.match(/^\|/gm) || []).length;

  if (h2Count >= 4) score += 4;
  else if (h2Count >= 2) score += 2;
  if (h3Count >= 3) score += 3;
  else if (h3Count >= 1) score += 1;
  if (listCount >= 5) score += 2;
  if (tableRows >= 3) score += 1;

  return Math.min(25, score);
}

function scoreKeywordRelevance(title: string, summary: string, content: string, brandName: string): { score: number; keywords: string[] } {
  const fullText = `${title} ${summary} ${content}`.toLowerCase();
  const foundKeywords: string[] = [];
  let score = 0;

  for (const kw of B2B_KEYWORDS) {
    if (fullText.includes(kw)) {
      foundKeywords.push(kw);
      score += 1;
    }
  }

  // Brand name mentions
  const brandMentions = (fullText.match(new RegExp(brandName.toLowerCase(), 'g')) || []).length;
  score += Math.min(5, brandMentions);

  return {
    score: Math.min(20, score),
    keywords: foundKeywords.slice(0, 20),
  };
}

function scoreFreshness(publishedDate: string | null): number {
  if (!publishedDate) return 5; // Unknown = neutral

  const pubDate = new Date(publishedDate);
  const now = new Date();
  const daysOld = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24));

  // Exponential decay: 15 -> 10 -> 5 -> 2 -> 0
  if (daysOld <= 7) return 15;
  if (daysOld <= 30) return 12;
  if (daysOld <= 90) return 8;
  if (daysOld <= 180) return 5;
  if (daysOld <= 365) return 2;
  return 0;
}

function scoreSearchIntent(intent: SearchIntent): number {
  return INTENT_WEIGHTS[intent] || 5;
}

function scoreBrandAuthority(title: string, summary: string, content: string, productCount: number): number {
  const fullText = `${title} ${summary} ${content}`;
  let score = 0;

  // Specific product model mentions (e.g., "Mavic 4 Pro", "Matrice 350")
  const modelPattern = /\b[A-Z][a-z]+ \d+[A-Za-z]*\b/g;
  const models = fullText.match(modelPattern) || [];
  score += Math.min(5, models.length);

  // Numerical specs (e.g., "45 minutes", "20km", "1-inch CMOS")
  const specPatterns = /\d+\s*(min|minute|hour|km|m|kg|g|mp|mah|ghz|fps|k|cm|mm|inch|w|v|a)\b/gi;
  const specs = fullText.match(specPatterns) || [];
  score += Math.min(5, Math.floor(specs.length / 2));

  // Use case mentions
  const useCases = ['inspection', 'surveying', 'mapping', 'agriculture', 'delivery', 'security', 'construction'];
  const useCaseCount = useCases.filter(uc => fullText.toLowerCase().includes(uc)).length;
  score += Math.min(3, useCaseCount);

  // Product catalog size bonus
  if (productCount > 100) score += 2;
  else if (productCount > 20) score += 1;

  return Math.min(15, score);
}

function scoreStructuralQuality(content: string): number {
  if (!content) return 0;
  let score = 0;

  // Has clear sections
  if (content.includes('## ')) score += 3;
  if (content.includes('### ')) score += 2;

  // Has lists (easy for AI to parse)
  if ((content.match(/^- /gm) || []).length >= 3) score += 2;

  // Has bold/emphasis (key points)
  if (content.includes('**')) score += 1;

  // Has citations or references
  if (content.includes('> ') || content.includes('Note:') || content.includes('http')) score += 1;

  // Has a conclusion or CTA
  if (content.toLowerCase().includes('learn more') || content.toLowerCase().includes('contact') ||
      content.toLowerCase().includes('available') || content.toLowerCase().includes('about')) score += 1;

  return Math.min(10, score);
}

export interface ArticleScore {
  total: number;
  depth: number;
  keywords: number;
  freshness: number;
  intent: number;
  authority: number;
  structure: number;
  intentType: SearchIntent;
  foundKeywords: string[];
  wordCount: number;
  qualityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export function scoreArticle(article: {
  title: string;
  summary: string;
  content: string;
  category: string;
  published_date: string | null;
  brand_name: string;
  product_count?: number;
}): ArticleScore {
  const intent = detectSearchIntent(article.title, article.summary, article.category);
  const keywordResult = scoreKeywordRelevance(article.title, article.summary, article.content, article.brand_name);
  const wordCount = article.content ? article.content.split(/\s+/).length : 0;

  const depth = scoreContentDepth(article.content);
  const keywords = keywordResult.score;
  const freshness = scoreFreshness(article.published_date);
  const intentScore = scoreSearchIntent(intent);
  const authority = scoreBrandAuthority(article.title, article.summary, article.content, article.product_count || 0);
  const structure = scoreStructuralQuality(article.content);

  const total = depth + keywords + freshness + intentScore + authority + structure;

  let qualityGrade: ArticleScore['qualityGrade'];
  if (total >= 85) qualityGrade = 'A+';
  else if (total >= 70) qualityGrade = 'A';
  else if (total >= 55) qualityGrade = 'B';
  else if (total >= 40) qualityGrade = 'C';
  else if (total >= 25) qualityGrade = 'D';
  else qualityGrade = 'F';

  return {
    total,
    depth,
    keywords,
    freshness,
    intent: intentScore,
    authority,
    structure,
    intentType: intent,
    foundKeywords: keywordResult.keywords,
    wordCount,
    qualityGrade,
  };
}

/**
 * Determine if an article should be kept or removed when brand has >6 articles.
 * Returns true if the article is worth keeping.
 */
export function shouldKeepArticle(score: ArticleScore, articleAgeDays: number): boolean {
  // Never remove articles with grade A or A+
  if (score.qualityGrade === 'A+' || score.qualityGrade === 'A') return true;

  // B-grade articles: keep if less than 180 days old
  if (score.qualityGrade === 'B' && articleAgeDays < 180) return true;

  // C-grade: keep if less than 90 days
  if (score.qualityGrade === 'C' && articleAgeDays < 90) return true;

  // D-grade: keep if less than 30 days (still fresh)
  if (score.qualityGrade === 'D' && articleAgeDays < 30) return true;

  // F-grade or old articles: candidates for removal
  return false;
}
