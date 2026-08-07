# Aegisky Medusa - Global UAV Trusted Trade Network (GUTN)

国际无人机B2B供应链合规交易平台 v5.0

## 技术栈

- **后端**: Medusa.js v2.18
- **前端**: Next.js 14.2.5 App Router
- **数据库**: PostgreSQL 16
- **缓存/队列**: Redis 7
- **搜索**: Meilisearch
- **部署**: Docker Compose

## 核心架构（v5.0 4个P0内核）

1. **Trade Kernel** - 9状态交易状态机，幂等性，乐观锁，pg_notify
2. **Double-Entry Ledger** - 复式记账，数据库触发器强制借贷平衡，29个标准会计科目
3. **Compliance Evidence Store** - SHA-256哈希链，法规版本化，决策证据快照
4. **Rule Engine** - JSON DSL规则引擎，14种操作符，9条预置出口管制规则

## 快速开始

### 环境要求
- Node.js 18+
- Docker & Docker Compose
- npm

### 启动服务

```powershell
# 1. 启动基础设施
docker-compose up -d medusa-postgres medusa-redis meilisearch

# 2. 启动后端
cd backend
npm install
npm run dev

# 3. 启动前端
cd ../storefront
npm install
npm run dev
```

前端: http://localhost:8000
后端: http://localhost:9000
控制塔: http://localhost:8000/en/control-tower

### 默认账号
- 管理员: admin@aegisky.com / admin123456
- Publishable API key: `pk_2f2350f9a72ea702246d0a68566194d73ff4ef26a7ff20f4b60294beb8869b0a`

## 项目结构

```
aegisky-medusa/
├── backend/              # Medusa.js 后端
│   └── src/migrations/   # v5.0数据库迁移
├── storefront/           # Next.js 前端
│   └── src/
│       ├── app/[lang]/   # 多语言页面
│       │   ├── control-tower/  # 合规控制塔
│       │   └── become-supplier/ # 供应商入驻
│       └── lib/control-tower/   # 4个内核TypeScript实现
├── data/                 # 数据镜像
├── blueprint-review/     # 架构审查文档
└── docker-compose.yml
```

## 合规特性

- OFAC/EU/UN制裁名单筛查
- ECCN出口管制分类
- 全面禁运国家自动拦截
- 受益所有人(UBO)穿透审查
- PEP（政治公众人物）标记
- 完整审计日志，不可篡改
- 银行级合规证据PDF导出

## 数据规模

- 6,384 商品
- 1,052 分类（62个根分类）
- 438 品牌
- 26,257 商品图片（全本地化）
- 71 商品视频

## 多语言支持

14种语言：English, 中文, Русский, Español, Français, Deutsch, 日本語, العربية, Polski, Dansk, Indonesia, Қазақша, Српски, اردو

## 许可证

Private - Aegisky Systems Ltd.
