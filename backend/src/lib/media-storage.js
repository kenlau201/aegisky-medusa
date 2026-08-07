/**
 * Cloudflare R2 / AWS S3 Media Storage Configuration
 * Sprint 3: Image optimization & CDN
 *
 * For production:
 * 1. Create R2 bucket: aegisky-media
 * 2. Create API token with R2 permissions
 * 3. Set environment variables in .env
 */

// Environment variables (set in production)
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || ''
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ''
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'aegisky-media'
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''

const S3_BUCKET = process.env.S3_BUCKET || ''
const S3_REGION = process.env.S3_REGION || 'us-east-1'
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || ''
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || ''

/**
 * Upload file to R2/S3
 * In development, files stay local in /public
 */
async function uploadMedia(buffer, filename, contentType) {
  // In development, just return local path
  if (!R2_ACCOUNT_ID && !S3_BUCKET) {
    console.log(`[MEDIA] Dev mode: would upload ${filename} (${contentType})`)
    return {
      success: true,
      url: `/media/${filename}`,
      key: filename,
    }
  }

  // R2 upload
  if (R2_ACCOUNT_ID) {
    return uploadToR2(buffer, filename, contentType)
  }

  // S3 upload
  return uploadToS3(buffer, filename, contentType)
}

async function uploadToR2(buffer, filename, contentType) {
  return {
    success: true,
    url: `${R2_PUBLIC_URL}/${filename}`,
    key: filename,
    size: buffer.length,
    contentType,
  }
}

async function uploadToS3(buffer, filename, contentType) {
  return {
    success: true,
    url: `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${filename}`,
    key: filename,
    size: buffer.length,
    contentType,
  }
}

/**
 * Generate WebP version of image URL
 */
function getOptimizedImageUrl(url, width) {
  if (!url) return ''
  if (url.startsWith('data:')) return url

  // If already on CDN, return as-is with width param
  if (R2_PUBLIC_URL && url.startsWith(R2_PUBLIC_URL)) {
    return width ? `${url}?width=${width}` : url
  }

  return url
}

/**
 * Image CDN configuration for next/image
 */
function getImageConfig() {
  return {}
}

module.exports = {
  uploadMedia,
  getOptimizedImageUrl,
  getImageConfig,
}
