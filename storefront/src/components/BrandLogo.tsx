'use client'

import { useState } from 'react'
import brandLogoMap from '@/lib/brand-logos.json'

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type LogoRounded = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'none'

const SIZE_MAP: Record<LogoSize, { box: string; text: string }> = {
  xs: { box: 'w-5 h-5', text: 'text-[10px]' },
  sm: { box: 'w-8 h-8', text: 'text-xs' },
  md: { box: 'w-10 h-10', text: 'text-sm' },
  lg: { box: 'w-16 h-16', text: 'text-lg' },
  xl: { box: 'w-24 h-24', text: 'text-2xl' },
}

const ROUNDED_MAP: Record<LogoRounded, string> = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
}

// Fallback: get initials from brand name
function getInitials(name: string): string {
  const clean = name.replace(/&amp;/g, '&').replace(/[^a-zA-Z0-9А-Яа-яЁё\s\-&.]/g, '').trim()
  const parts = clean.split(/[\s\-&.]+/).filter(p => p.length > 0)
  if (parts.length === 0) return name.charAt(0).toUpperCase()
  if (parts.length === 1) {
    const w = parts[0]
    if (w.length <= 3) return w.toUpperCase()
    return w.substring(0, 2).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}

// Fallback: consistent color from name hash
function getFallbackColor(name: string): { bg: string; text: string } {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return { bg: `hsl(${hue}, 55%, 94%)`, text: `hsl(${hue}, 60%, 30%)` }
}

interface BrandLogoProps {
  slug: string
  name: string
  size?: LogoSize
  rounded?: LogoRounded
  className?: string
  showName?: boolean
}

export default function BrandLogo({ slug, name, size = 'md', rounded = 'md', className = '', showName = false }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false)
  const sizeCls = SIZE_MAP[size]
  const roundedCls = ROUNDED_MAP[rounded]

  const logoFile = (brandLogoMap as Record<string, string>)[slug?.toLowerCase()]
  const logoUrl = logoFile ? `/images/brands/${logoFile}` : null

  const displayName = name.replace(/&amp;/g, '&')

  // If we have a logo URL and no error, show the image
  if (logoUrl && !imgError) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={displayName}
          className={`${sizeCls.box} object-contain ${roundedCls} bg-white`}
          onError={() => setImgError(true)}
          loading="lazy"
        />
        {showName && <span className="ml-2 text-sm text-gray-700">{displayName}</span>}
      </div>
    )
  }

  // Fallback: initials with brand color
  const initials = getInitials(displayName)
  const colors = getFallbackColor(displayName)

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`${sizeCls.box} ${roundedCls} flex items-center justify-center font-bold ${sizeCls.text}`}
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {initials}
      </div>
      {showName && <span className="ml-2 text-sm text-gray-700">{displayName}</span>}
    </div>
  )
}
