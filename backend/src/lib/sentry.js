/**
 * Sentry Error Monitoring
 * Sprint 4: Production readiness
 *
 * Set SENTRY_DSN in .env to enable
 * Get DSN from https://sentry.io
 */

const SENTRY_DSN = process.env.SENTRY_DSN || ''
const SENTRY_ENVIRONMENT = process.env.NODE_ENV || 'development'
const SENTRY_ENABLED = SENTRY_DSN && SENTRY_DSN.length > 0

let Sentry = null

if (SENTRY_ENABLED) {
  try {
    Sentry = require('@sentry/node')
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: SENTRY_ENVIRONMENT,
      tracesSampleRate: 0.1, // 10% of requests for performance monitoring
      profilesSampleRate: 0.1,
      enabled: true,
    })
    console.log(`[Sentry] Initialized for environment: ${SENTRY_ENVIRONMENT}`)
  } catch (e) {
    console.log('[Sentry] Not installed, error monitoring disabled')
    Sentry = null
  }
}

/**
 * Capture exception to Sentry
 */
function captureException(error, context) {
  if (Sentry && SENTRY_ENABLED) {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        service: 'aegisky-backend',
        environment: SENTRY_ENVIRONMENT,
      },
    })
  }
  // Always log locally
  console.error('[ERROR]', error.message, context || '')
}

/**
 * Capture message to Sentry
 */
function captureMessage(message, level) {
  if (!level) level = 'info'
  if (Sentry && SENTRY_ENABLED) {
    Sentry.captureMessage(message, level)
  }
}

/**
 * Performance monitoring span
 */
function startSpan(name, op) {
  if (Sentry && SENTRY_ENABLED) {
    return Sentry.startSpan({ name, op }, () => {})
  }
  return null
}

module.exports = {
  captureException,
  captureMessage,
  startSpan,
  Sentry,
  isEnabled: () => SENTRY_ENABLED && !!Sentry,
}
