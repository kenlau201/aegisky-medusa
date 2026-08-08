'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const lang = params.lang as string;
  const slug = params.slug as string;

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link href={`/${lang}/products`} className="text-blue-600 hover:underline">← Back to Products</Link>
        </div>
      </div>
    );
  }

  // Build gallery images
  const images: string[] = [];
  if (product.main_image) images.push(product.main_image);
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img: any) => {
      const url = typeof img === 'string' ? img : img.url || img.src;
      if (url && !images.includes(url)) images.push(url);
    });
  }

  // Build videos
  const videos: string[] = [];
  if (product.videos && Array.isArray(product.videos)) {
    product.videos.forEach((v: any) => {
      const url = typeof v === 'string' ? v : v.url || v.src;
      if (url) videos.push(url);
    });
  }

  // Parse brands
  const brands = product.brands && Array.isArray(product.brands) ? product.brands : [];
  const categories = product.categories && Array.isArray(product.categories) ? product.categories : [];

  // Format price
  const formatPrice = (p: any) => {
    if (!p) return null;
    const num = parseFloat(p);
    return isNaN(num) ? p : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const price = formatPrice(product.sale_price || product.price);
  const regularPrice = product.regular_price && product.regular_price !== (product.sale_price || product.price)
    ? formatPrice(product.regular_price) : null;
  const discount = regularPrice && product.sale_price
    ? Math.round((1 - parseFloat(product.sale_price) / parseFloat(product.regular_price)) * 100)
    : null;

  // Decode HTML entities in description
  const description = product.description
    ?.replace(/&#8212;/g, '—')
    ?.replace(/&#8211;/g, '–')
    ?.replace(/&amp;/g, '&')
    ?.replace(/&lt;/g, '<')
    ?.replace(/&gt;/g, '>')
    ?.replace(/&quot;/g, '"')
    ?.replace(/&#39;/g, "'")
    ?.replace(/\n\n/g, '</p><p>')
    ?.replace(/\n/g, '<br/>');

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href={`/${lang}`} className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href={`/${lang}/products`} className="hover:text-blue-600">Products</Link>
            {categories[0] && (
              <>
                <span>/</span>
                <span className="text-gray-900 truncate max-w-[200px]">{categories[0].name}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mb-4">
              <div className="aspect-square flex items-center justify-center p-8 relative">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                )}
                {discount && discount > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{discount}%
                  </span>
                )}
                {product.on_sale && (
                  <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    SALE
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.slice(0, 8).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-colors ${
                      selectedImage === i ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain bg-gray-50 p-1" />
                  </button>
                ))}
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Videos</h3>
                <div className="space-y-2">
                  {videos.map((v, i) => (
                    <video key={i} src={v} controls className="w-full rounded-lg border border-gray-200" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Brands */}
            {brands.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                {brands.map((b: any) => (
                  <Link key={b.id} href={`/${lang}/supplier/${b.slug}`} className="text-sm text-blue-600 hover:underline font-medium">
                    {b.name}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>

            {/* SKU */}
            {product.sku && (
              <div className="text-sm text-gray-500 mb-4">SKU: {product.sku}</div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              {price && <span className="text-3xl font-bold text-blue-600">{price}</span>}
              {regularPrice && (
                <span className="text-lg text-gray-400 line-through">{regularPrice}</span>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <div className="text-gray-600 mb-6 leading-relaxed" dangerouslySetInnerHTML={{
                __html: product.short_description
                  .replace(/&#8212;/g, '—')
                  .replace(/&amp;/g, '&')
              }} />
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {product.in_stock ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-green-700 font-medium text-sm">In Stock</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-red-700 font-medium text-sm">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >−</button>
                <span className="px-4 py-2 font-medium text-gray-900 min-w-[50px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >+</button>
              </div>
              <button className="flex-1 bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Add to Cart
              </button>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="border-t pt-4">
                <div className="text-sm text-gray-500 mb-2">Categories:</div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c: any) => (
                    <Link key={c.id} href={`/${lang}/categories/${c.slug}`} className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1 rounded-full">
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Notice */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <div className="text-sm text-amber-800">
                  <strong>Export Compliance:</strong> This product may be subject to dual-use export controls (EU 2021/821, US EAR). All international orders require end-user verification.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              {['description', 'specifications', 'shipping'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 text-sm font-semibold border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose prose-gray max-w-none">
                {description ? (
                  <div dangerouslySetInnerHTML={{ __html: `<p>${description}</p>` }} />
                ) : (
                  <p className="text-gray-500">No detailed description available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-2xl">
                <table className="w-full text-sm">
                  <tbody>
                    {product.sku && (
                      <tr className="border-b">
                        <td className="py-3 text-gray-500 font-medium w-40">SKU</td>
                        <td className="py-3 text-gray-900">{product.sku}</td>
                      </tr>
                    )}
                    <tr className="border-b">
                      <td className="py-3 text-gray-500 font-medium">Price</td>
                      <td className="py-3 text-gray-900">{price}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 text-gray-500 font-medium">Stock Status</td>
                      <td className="py-3">
                        {product.in_stock
                          ? <span className="text-green-600">In Stock</span>
                          : <span className="text-red-600">Out of Stock</span>}
                      </td>
                    </tr>
                    {product.currency && (
                      <tr className="border-b">
                        <td className="py-3 text-gray-500 font-medium">Currency</td>
                        <td className="py-3 text-gray-900">{product.currency}</td>
                      </tr>
                    )}
                    {product.image_count > 0 && (
                      <tr className="border-b">
                        <td className="py-3 text-gray-500 font-medium">Images</td>
                        <td className="py-3 text-gray-900">{product.image_count}</td>
                      </tr>
                    )}
                    {product.video_count > 0 && (
                      <tr className="border-b">
                        <td className="py-3 text-gray-500 font-medium">Videos</td>
                        <td className="py-3 text-gray-900">{product.video_count}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-2xl text-gray-600 text-sm space-y-4">
                <p><strong>Worldwide Shipping:</strong> We ship to over 100 countries via DHL, FedEx, and UPS.</p>
                <p><strong>B2B Orders:</strong> For bulk orders, please contact our sales team for customized shipping and pricing.</p>
                <p><strong>Export Compliance:</strong> All shipments are subject to export control regulations. Required documentation includes end-user certificates for dual-use items.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p: any) => (
                <Link key={p.id} href={`/${lang}/products/${p.slug || p.id}`} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
                  <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                    {p.main_image ? (
                      <img src={p.main_image} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{p.name}</h4>
                    {p.price && <div className="text-sm font-bold text-blue-600 mt-1">{formatPrice(p.sale_price || p.price)}</div>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
