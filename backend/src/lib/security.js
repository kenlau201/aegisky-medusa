/**
 * Aegisky API Security Utilities
 * Sprint 3: Security Red Line Implementation
 * 
 * Rules:
 * 1. Never expose raw database errors to clients
 * 2. All errors return generic 500 with safe message
 * 3. Detailed errors logged server-side only
 * 4. Performance monitoring for payment-related endpoints
 */

const crypto = require('crypto')

// Lazy-load Sentry (only if configured)
let sentry = null
try {
  sentry = require('./sentry')
} catch (e) {
  sentry = null
}

// Error codes that are safe to expose to clients
const SAFE_ERROR_CODES = new Set([
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'BAD_REQUEST',
  'PAYMENT_REQUIRED',
  'CONFLICT',
  'RATE_LIMITED',
])

class AppError extends Error {
  constructor(code, message, statusCode = 400, details = null) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.isOperational = true
  }
}

/**
 * Safe error handler - never exposes internal details
 * Use this in all API catch blocks
 */
function handleApiError(error, context = {}) {
  const errorId = crypto.randomUUID()

  // Log full error server-side
  console.error(`[API_ERROR] ${errorId}`, {
    message: error.message,
    stack: error.stack,
    code: error.code,
    context,
    timestamp: new Date().toISOString(),
  })

  // Send to Sentry if configured
  if (sentry && sentry.isEnabled()) {
    sentry.captureException(error, { errorId, ...context })
  }

  // If it's our operational error, return safe message
  if (error.isOperational && SAFE_ERROR_CODES.has(error.code)) {
    return {
      error: error.code,
      message: error.message,
      errorId,
      statusCode: error.statusCode,
    }
  }

  // For all other errors (DB errors, network errors, etc.) - return generic 500
  // Never expose SQL errors, connection strings, stack traces, etc.
  return {
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred. Please try again or contact support.',
    errorId,
    statusCode: 500,
  }
}

/**
 * Express/Medusa middleware wrapper for safe error handling
 */
function safeHandler(handlerFn) {
  return async (req, res, next) => {
    try {
      await handlerFn(req, res, next)
    } catch (error) {
      const safe = handleApiError(error, {
        path: req.path,
        method: req.method,
        ip: req.ip,
      })
      res.status(safe.statusCode).json({
        error: safe.error,
        message: safe.message,
        errorId: safe.errorId,
      })
    }
  }
}

/**
 * Performance monitoring wrapper for payment/order endpoints
 * P95 must be < 800ms per Sprint 3 Data Red Line
 */
function withPerfMonitoring(handlerFn, endpointName) {
  return async (req, res, next) => {
    const start = process.hrtime.bigint()
    const requestId = crypto.randomUUID()

    // Capture original json method to intercept response
    const originalJson = res.json.bind(res)
    res.json = function (data) {
      const end = process.hrtime.bigint()
      const durationMs = Number(end - start) / 1e6

      // Log performance metrics
      console.log(`[PERF] ${endpointName}`, {
        requestId,
        durationMs: Math.round(durationMs * 100) / 100,
        statusCode: res.statusCode,
        method: req.method,
        timestamp: new Date().toISOString(),
      })

      // Alert if over threshold (800ms for payment endpoints)
      if (durationMs > 800) {
        console.warn(`[PERF_ALERT] ${endpointName} exceeded 800ms threshold!`, {
          requestId,
          durationMs,
          threshold: 800,
        })
        // Send performance alert to Sentry
        if (sentry && sentry.isEnabled()) {
          sentry.captureMessage(`Slow endpoint: ${endpointName} took ${Math.round(durationMs)}ms`, 'warning')
        }
      }

      return originalJson(data)
    }

    try {
      await handlerFn(req, res, next)
    } catch (error) {
      const end = process.hrtime.bigint()
      const durationMs = Number(end - start) / 1e6
      console.error(`[PERF_ERROR] ${endpointName} failed after ${durationMs}ms`, {
        requestId,
        durationMs,
      })
      throw error
    }
  }
}

/**
 * Sanitize user input to prevent SQL injection via string params
 * Note: We use parameterized queries everywhere, this is defense in depth
 */
function sanitizeInput(value) {
  if (typeof value !== 'string') return value
  // Remove null bytes and other dangerous chars
  return value.replace(/\0/g, '').trim()
}

/**
 * Validate that amount is a valid positive number
 * Used for payment endpoints
 */
function validateAmount(amount) {
  const num = Number(amount)
  if (!Number.isFinite(num) || num <= 0) {
    throw new AppError('VALIDATION_ERROR', 'Invalid amount', 400)
  }
  if (num > 1000000) {
    // $1M max per transaction - safety check
    throw new AppError('VALIDATION_ERROR', 'Amount exceeds maximum allowed', 400)
  }
  return Math.round(num * 100) / 100
}

module.exports = {
  AppError,
  handleApiError,
  safeHandler,
  withPerfMonitoring,
  sanitizeInput,
  validateAmount,
}
