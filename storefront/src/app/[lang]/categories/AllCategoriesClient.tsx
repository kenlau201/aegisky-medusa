'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AllCategoriesClient({ lang, categories }: { lang: string; categories: any[] }) {
  const params = useParams();
  const prefix = `/${params.lang}`;

  // Build category tree
  const rootCategories = categories.filter(c => !c.parent || c.parent === 0);
  const getChildren = (parentId: number) => categories.filter(c => c.parent === parentId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">All Categories</h1>
        <p className="text-gray-500 mb-8">{categories.length} categories</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rootCategories.map((cat) => {
            const children = getChildren(cat.id);
            return (
              <div key={cat.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <Link href={`${prefix}/category/${cat.slug}`} className="text-lg font-semibold text-blue-600 hover:underline">
                  {cat.name}
                </Link>
                {cat.product_count > 0 && (
                  <span className="ml-2 text-sm text-gray-400">({cat.product_count})</span>
                )}
                {children.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {children.slice(0, 8).map((child) => (
                      <Link
                        key={child.id}
                        href={`${prefix}/category/${child.slug}`}
                        className="text-sm text-gray-600 hover:text-blue-600"
                      >
                        {child.name}
                      </Link>
                    ))}
                    {children.length > 8 && (
                      <span className="text-sm text-gray-400">+{children.length - 8} more</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
