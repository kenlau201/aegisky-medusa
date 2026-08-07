'use client'

import { useEffect } from 'react'

/**
 * Sentry initialization component
 * Sprint 4: Error monitoring placeholder
 *
 * To enable Sentry in production:
 * 1. npm install @sentry/nextjs
 * 2. Set NEXT_PUBLIC_SENTRY_DSN env var
 * 3. Add Sentry initialization code here
 *
 * This is intentionally a no-op until Sentry is installed,
 * preventing build errors when the package is absent.
 */
export default function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) return

    // Sentry will be initialized here after installing @sentry/nextjs
    // Example:
    // import('@sentry/nextjs').then(Sentry => {
    //   Sentry.init({ dsn, tracesSampleRate: 0.1 })
    // })
  }, [])

  return null
}
