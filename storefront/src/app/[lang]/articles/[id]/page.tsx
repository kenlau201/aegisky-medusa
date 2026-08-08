'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function ArticleContent() {
  const params = useParams();
  const lang = params.lang as string;
  const id = params.id as string;

  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/articles/${id}`)
      .then(r => r.json())
      .then(data => {
        setArticle(data.article);
        setRelatedArticles(data.relatedArticles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
          <p className="text-gray-600 mb-4">The article you're looking for doesn't exist.</p>
          <Link href={`/${lang}/insights`} className="text-blue-600 hover:underline">← Back to Insights</Link>
        </div>
      </div>
    );
  }

  const brandName = article.brand_name || 'Aegisky';
  const brandSlug = article.brand_slug || '';
  const publishedDate = article.published_date
    ? new Date(article.published_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  // Parse markdown-like content
  // Helper to render inline bold markdown (**text**)
  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderContent = (content: string) => {
    if (!content) return <p className="text-gray-600">Full article content coming soon.</p>;
    return content.split('\n').map((line: string, i: number) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-10 mb-4 text-gray-900">{renderInline(line.slice(3))}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-8 mb-3 text-gray-900">{renderInline(line.slice(4))}</h3>;
      if (line.startsWith('- ')) return <li key={i} className="ml-6 mb-2 text-gray-700 list-disc">{renderInline(line.slice(2))}</li>;
      if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-6 bg-blue-50 py-3 pr-4 rounded-r">{renderInline(line.slice(2))}</blockquote>;
      if (/^\d+\.\s/.test(line)) return <p key={i} className="mb-3 text-gray-700 leading-relaxed">{renderInline(line)}</p>;
      if (line.trim() === '') return <div key={i} className="h-4" />;
      return <p key={i} className="mb-4 text-gray-700 leading-relaxed text-lg">{renderInline(line)}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link href={`/${lang}`} className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href={`/${lang}/insights`} className="hover:text-blue-600">Insights</Link>
            <span>/</span>
            {brandSlug && (
              <>
                <Link href={`/${lang}/supplier/${brandSlug}`} className="hover:text-blue-600">{brandName}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 line-clamp-1">{article.title}</span>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {article.category && (
              <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
              </span>
            )}
            {brandSlug && (
              <Link href={`/${lang}/supplier/${brandSlug}`} className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 bg-gray-100 px-3 py-1 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {brandName}
              </Link>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>
          {article.summary && (
            <p className="text-xl text-gray-600 mb-6">{article.summary}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
            <span className="font-medium text-gray-700">{article.author || 'Aegisky Editorial Team'}</span>
            {publishedDate && (
              <>
                <span>•</span>
                <span>{publishedDate}</span>
              </>
            )}
            {article.read_time && (
              <>
                <span>•</span>
                <span>{article.read_time}</span>
              </>
            )}
            {article.source && (
              <>
                <span>•</span>
                <span className="text-gray-400">Source: {article.source}</span>
              </>
            )}
          </div>
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          {renderContent(article.content)}
        </article>

        {/* Original Source Link */}
        {article.url && (
          <div className="mt-10 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Original Source:</span> This article is based on information from {article.source}.
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              View original source
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>
        )}

        {/* Brand CTA */}
        {brandSlug && (
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-2">Learn more about {brandName}</h3>
            <p className="text-blue-100 mb-4">
              Explore {brandName}'s full product catalog, capabilities, and contact information on the Aegisky platform.
            </p>
            <Link
              href={`/${lang}/supplier/${brandSlug}`}
              className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              View {brandName} Profile →
            </Link>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedArticles.map((ra: any) => (
                <Link
                  key={ra.id}
                  href={`/${lang}/articles/${ra.id}`}
                  className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {ra.category && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{ra.category}</span>
                    )}
                    {ra.published_date && (
                      <span className="text-xs text-gray-400">
                        {new Date(ra.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 line-clamp-2">{ra.title}</h3>
                  {ra.summary && <p className="text-sm text-gray-600 line-clamp-2">{ra.summary}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArticleDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <ArticleContent />
    </Suspense>
  );
}
