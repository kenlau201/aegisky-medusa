export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="animate-pulse">
        {/* Hero skeleton */}
        <div className="h-48 md:h-64 bg-gray-200 rounded-2xl mb-12"></div>

        {/* Section title */}
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
