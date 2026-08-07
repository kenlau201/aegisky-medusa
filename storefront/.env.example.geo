# ============================================
# GEO (Generative Engine Optimization) 配置
# ============================================

# DeepSeek API Key - 用于内容优化
# 获取地址: https://platform.deepseek.com/api-keys
# 价格非常便宜，优化1000条内容大约需要$1-2
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here

# Perplexity API Key - 用于AI引用监测
# 获取地址: https://www.perplexity.ai/settings/api
# 每次检查20个问题大约消耗$0.20
PERPLEXITY_API_KEY=pplx-your-perplexity-api-key-here

# Cron Secret - 定时任务密钥
# 用于外部cron调用时的身份验证
CRON_SECRET=aegisky-geo-cron-2026-change-this-in-production

# ============================================
# 自动运行方式
# ============================================

# 方式1: Vercel Cron (推荐，部署到Vercel时自动生效)
# 在 vercel.json 中添加:
# {
#   "crons": [{
#     "path": "/api/geo/cron",
#     "schedule": "0 8 * * *"
#   }]
# }

# 方式2: 系统Cron (Linux/Mac)
# 每天早上8点运行:
# 0 8 * * * curl -H "Authorization: Bearer your-cron-secret" https://yourdomain.com/api/geo/cron

# 方式3: Windows Task Scheduler
# 创建基本任务，每天运行:
# powershell -Command "Invoke-WebRequest -Uri 'https://yourdomain.com/api/geo/cron' -Headers @{'Authorization'='Bearer your-cron-secret'}"

# 方式4: 手动运行
# 在控制塔GEO页面点击按钮，或者直接调用:
# curl -X POST http://localhost:8000/api/geo/enqueue
# curl -X POST http://localhost:8000/api/geo/optimize
# curl -X POST http://localhost:8000/api/geo/monitor
