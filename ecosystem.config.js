# ============================================
# Aegisky Medusa - PM2 Production Configuration
# ============================================
module.exports = {
  apps: [
    {
      name: 'aegisky-backend',
      script: 'npx',
      args: 'medusa start --port 9000 --host 0.0.0.0',
      cwd: './backend',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        MEDUSA_ENV: 'production',
        PORT: 9000,
      },
      env_production: {
        NODE_ENV: 'production',
        MEDUSA_ENV: 'production',
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
    {
      name: 'aegisky-storefront',
      script: 'npm',
      args: 'start -- -p 8000',
      cwd: './storefront',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/storefront-error.log',
      out_file: './logs/storefront-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
}
