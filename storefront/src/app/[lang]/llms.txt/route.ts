import { NextRequest } from 'next/server';
import { generateLlmsTxt } from '@/lib/geo/llms-generator';

export const runtime = 'nodejs';

// ISR: 每小时重新生成一次
export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: { lang: string } }
) {
  try {
    const lang = params.lang || 'en';
    const allowedLangs = ['en', 'es', 'fr', 'ar', 'ja', 'zh', 'ru', 'de', 'pl', 'da', 'id', 'kk', 'sr', 'ur'];
    
    const finalLang = allowedLangs.includes(lang) ? lang : 'en';

    const content = generateLlmsTxt({
      lang: finalLang,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://aegisky.com',
    });

    return new Response(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'llm-index, all',
      },
    });
  } catch (error) {
    console.error('Error generating llms.txt:', error);
    return new Response('# Aegisky\n\nGlobal UAV Trusted Trade Network', {
      status: 200,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }
}
