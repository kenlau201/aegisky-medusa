/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production: standalone output for Docker
  output: 'standalone',

  // Enable React strict mode
  reactStrictMode: true,

  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Image optimization with R2/S3 CDN support
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cloudflare R2 / S3 CDN domains (configure in production)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Optional: Use custom image optimization CDN
    // path: 'https://cdn.aegisky.com/_next/image',
  },

  // Experimental features for production
  experimental: {
    // Optimize server components
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Reduce bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
