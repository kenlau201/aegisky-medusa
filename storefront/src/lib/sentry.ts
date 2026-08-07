/**
 * Sentry Frontend Error Monitoring
 * Sprint 4: Production readiness
 *
 * To enable:
 * 1. npm install @sentry/nextjs
 * 2. Set NEXT_PUBLIC_SENTRY_DSN env var
 * 3. Initialize in SentryInit component
 */

export function initSentry() {
  // Placeholder - see SentryInit.tsx for setup instructions
}

export function captureFrontendError(error: Error, context?: Record<string, any>) {
  // Always log to console
  console.error('[Frontend Error]', error, context)

  // When Sentry is installed, add:
  // Sentry.captureException(error, { extra: context })
}
