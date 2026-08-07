import { loadEnv, Modules, defineConfig } from '@medusajs/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL || 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6380',
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:8000',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:9000',
      authCors: process.env.AUTH_CORS || 'http://localhost:9000',
      jwtSecret: process.env.JWT_SECRET || 'aegisky-jwt-secret-2026',
      cookieSecret: process.env.COOKIE_SECRET || 'aegisky-cookie-secret-2026',
    }
  },
  admin: {
    disable: false,
    path: '/app',
  },
  modules: {
    [Modules.API_KEY]: {
      resolve: '@medusajs/api-key',
    },
  }
})
