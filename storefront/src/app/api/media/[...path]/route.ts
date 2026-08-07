import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const MEDIA_ROOT = 'D:\\项目备份\\Aegisky-Medusa\\scraper'

// Common MIME types
const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    let filePath = path.join(MEDIA_ROOT, ...params.path)

    // Security: ensure path is within MEDIA_ROOT
    let resolvedPath = path.resolve(filePath)
    if (!resolvedPath.startsWith(path.resolve(MEDIA_ROOT))) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Fuzzy matching for files that don't exist exactly
    // Also search in images_original for legacy files (gallery_0.jpg vs gallery_000.jpg)
    if (!fs.existsSync(resolvedPath)) {
      const dir = path.dirname(resolvedPath)
      const baseName = path.basename(resolvedPath, path.extname(resolvedPath))
      const galleryMatch = baseName.match(/^(gallery_\d+?)\d*$/)
      const searchPrefix = galleryMatch ? galleryMatch[1] : baseName.substring(0, baseName.length - 2)
      
      // List of directories to search (current dir + images_original fallback)
      const searchDirs = [dir]
      if (dir.endsWith(path.join('images', '')) || dir.includes(path.sep + 'images' + path.sep)) {
        // Also check images_original for this product ID
        const productId = path.basename(dir)
        const origDir = path.join(path.dirname(dir), 'images_original', productId)
        if (fs.existsSync(origDir)) {
          searchDirs.push(origDir)
        }
      }

      for (const searchDir of searchDirs) {
        if (!fs.existsSync(searchDir)) continue
        const files = fs.readdirSync(searchDir)
        let match = files.find(f => {
          const fBase = path.basename(f, path.extname(f))
          return fBase === baseName
        })
        if (!match) {
          match = files.find(f => {
            const fBase = path.basename(f, path.extname(f))
            return fBase.startsWith(searchPrefix) || fBase.startsWith(baseName.substring(0, 8))
          })
        }
        if (!match) {
          // Match gallery_N with gallery_NNN (single digit vs three digits)
          const galleryNumMatch = baseName.match(/^gallery_(\d+)$/)
          if (galleryNumMatch) {
            const num = parseInt(galleryNumMatch[1], 10)
            match = files.find(f => {
              const fMatch = f.match(/^gallery_0*(\d+)\./)
              return fMatch && parseInt(fMatch[1], 10) === num
            })
          }
        }
        if (!match && files.length > 0) {
          match = files.find(f => /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i.test(f))
        }
        if (match) {
          filePath = path.join(searchDir, match)
          resolvedPath = path.resolve(filePath)
          break
        }
      }
    }

    if (!fs.existsSync(resolvedPath)) {
      return new NextResponse('Not found', { status: 404 })
    }

    const stat = fs.statSync(resolvedPath)
    if (!stat.isFile()) {
      return new NextResponse('Not found', { status: 404 })
    }

    const ext = path.extname(resolvedPath).toLowerCase()
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'
    const fileSize = stat.size

    // Handle Range requests (important for video streaming)
    const rangeHeader = request.headers.get('range')

    if (rangeHeader) {
      // Parse Range header: "bytes=start-end"
      const rangeMatch = rangeHeader.match(/bytes=(\d*)-(\d*)/)
      if (!rangeMatch) {
        return new NextResponse('Invalid Range header', { status: 416 })
      }

      let start = rangeMatch[1] ? parseInt(rangeMatch[1], 10) : 0
      let end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : fileSize - 1

      // Clamp values
      if (start >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` },
        })
      }
      end = Math.min(end, fileSize - 1)
      const chunkSize = end - start + 1

      // Create read stream for the chunk
      const stream = fs.createReadStream(resolvedPath, { start, end })

      // Convert stream to ReadableStream for NextResponse
      const readableStream = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk) => controller.enqueue(chunk))
          stream.on('end', () => controller.close())
          stream.on('error', (err) => controller.error(err))
        },
        cancel() {
          stream.destroy()
        },
      })

      return new NextResponse(readableStream, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    // No Range request - stream entire file (better than readFileSync for large files)
    const stream = fs.createReadStream(resolvedPath)
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk))
        stream.on('end', () => controller.close())
        stream.on('error', (err) => controller.error(err))
      },
      cancel() {
        stream.destroy()
      },
    })

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Media error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
