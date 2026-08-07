# Aegisky Medusa 项目记忆恢复指令

> 将此完整prompt粘贴到新对话窗口，即可立即恢复项目开发状态，无需重新搭建。

---

## 项目身份与角色设定

你正在协助一位**不懂技术的项目负责人**开发 **Aegisky Medusa** —— 国际无人机B2B供应链平台。你的角色是**国际顶级全栈架构师**，执行零容忍精准修复，直接给可执行代码和命令，不要理论方案。

**用户偏好铁律：**
- 直接执行，不要问"要不要做"，不要给方案让用户选
- 零容忍TypeScript/Next.js/Redis/数据库错误
- 文件隔离原则：项目在D盘，C盘只放系统，定期清理Docker冗余
- 提供可直接执行的 .bat/.ps1 脚本，不要理论步骤
- 逻辑→架构→技术→商业→执行 一体化闭环
- 禁止从零重建，禁止推翻已完成功能，所有修改基于现有代码

---

## 技术栈与环境

| 组件 | 版本/配置 |
|------|-----------|
| 后端框架 | Medusa.js v2.18 |
| 前端框架 | Next.js 14.2.5 (App Router) |
| 数据库 | PostgreSQL 16 (Docker, 端口5434) |
| 缓存/队列 | Redis 7 (Docker, 端口6380) |
| 搜索引擎 | Meilisearch (Docker, 端口7700) |
| 部署方式 | Docker Compose |
| 包管理 | npm (--legacy-peer-deps) |

**项目根目录：** `D:\项目备份\Aegisky-Medusa\aegisky-medusa\`
- 后端：`backend/` (端口9000)
- 前端：`storefront/` (端口8000)
- 数据镜像：`data/mirror/` (products.json, categories.json, brands.json)

**Docker服务信息：**
- PostgreSQL: 用户`medusa` / 密码`medusa_password` / 数据库`medusa-aegisky`
- Meilisearch MASTER_KEY: `aegisky-meilisearch-master-key-2026`
- 后端管理员: admin@aegisky.com / admin123456
- Publishable API key: `pk_2f2350f9a72ea702246d0a68566194d73ff4ef26a7ff20f4b60294beb8869a0a`

---

## 启动命令（PowerShell管理员）

```powershell
# 启动Docker服务
Set-Location "D:\项目备份\Aegisky-Medusa\aegisky-medusa"
docker-compose up -d

# 启动后端（端口9000）
Set-Location "D:\项目备份\Aegisky-Medusa\aegisky-medusa\backend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/c","npm run dev > %TEMP%\medusa-be.log 2>&1" -PassThru -WindowStyle Hidden

# 启动前端（端口8000，数据更新后必须清.next缓存）
Set-Location "D:\项目备份\Aegisky-Medusa\aegisky-medusa\storefront"
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Start-Process -FilePath "cmd.exe" -ArgumentList "/c","npm run dev > %TEMP%\storefront.log 2>&1" -PassThru -WindowStyle Hidden

# 杀所有node进程
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 数据规模

| 数据表 | 数量 | 说明 |
|--------|------|------|
| aegisky_products | 6384 | 全量商品，含图片/视频/属性/规格 |
| aegisky_categories | 1052 | 62个根分类，多层级 |
| aegisky_brands | 438 | DJI/Autel/SIYI等无人机品牌 |
| aegisky_tags | 9 | 应用领域标签 |
| 商品图片 | 26257张 | 全量本地化 `/images/products/{ID}/gallery_{N}.{ext}` |
| 商品视频 | 71个 | 本地化 `/videos/{ID}/video_{N}.mp4` |
| 分类图片 | 1037张 | 本地化 `/images/categories/cat_{ID}.{ext}` |
| 品牌LOGO | 432个 | 本地化 `/images/brands/` |

**关键商品ID：**
- 4708: Matrice 300 RTK (8图7视频)
- 4710: Matrice 300 RTK Combo (8图7视频)
- 4712: Matrice 300 RTK + Zenmuse H20T (3图7视频+5描述图)
- 41286: 配件（非整机）

---

## 已完成功能清单（截至2026-08-06）

### ✅ 核心商城功能
- 商品列表/详情/分类/品牌/搜索/筛选/排序/分页
- 购物车/结算/RFQ询价/对比
- 多标签页（描述/规格/配送/评价）
- 图片画廊+灯箱+视频嵌入描述
- 数量加减/收藏/分享

### ✅ B2B企业功能
- HS海关编码智能推断（电池8507.60/电机8501.31/相机8525.80/无人机8806.20等）
- 认证徽章（CE/FCC/RoHS/UN38.3/FCC Part 15/CE RED）
- 贸易条款（FOB/CIF/EXW/DDP Incoterms 2020）
- MOQ最小起订量
- Shipping标签页4卡片：全球物流/贸易保障/支付方式/清关文件
- 批量询价/企业用户注册

### ✅ SaaS多租户
- 三档定价：Free / Professional $199/月 / Enterprise $499/月
- 供应商中心/订单管理/RFQ管理
- 经销商分级权限架构

### ✅ 供应商与解决方案板块（参考UST网站）
- 供应商目录页 `/suppliers`
- 12个解决方案分类页 `/solutions/[slug]`
- 供应商详情页 `/supplier/[slug]`
- 9个应用领域富内容页 `/applications/[slug]`

### ✅ 多语言多货币
- 14种语言：en/zh/ru/es/fr/de/ja/ar/pl/da/id/kk/sr/ur
- 14种货币：USD/CNY/EUR/GBP/JPY/RUB/AED/HKD/PLN/DKK/PKR/IDR/KZT/RSD
- 实时汇率（Context + mounted状态控制hydration一致）
- 俄语→英语逐词翻译系统（词干提取+短语替换+缩写，约3000+词汇）
- 中文UI已完整翻译（导航/筛选/排序/分页/按钮）

### ✅ SEO与性能
- 完整sitemap（全部商品/分类/品牌/静态页+14语言alternates）
- 分类API模块级缓存（60秒TTL，31秒→1.1秒）
- 商品详情页dynamic import ssr:false + 骨架屏（解决hydration错误）
- 图片切换性能优化（移除key重挂载，直接src替换）
- 品牌LOGO真实图片+首字母回退

### ✅ 媒体资源全本地化
- 0个远程图片/视频URL，全部本地存储
- 商品描述中远程图片已本地化
- 占位图placeholder.svg
- 视频嵌入商品描述原始位置（非画廊）

---

## 关键文件路径速查

### 前端核心
| 文件 | 作用 | 注意事项 |
|------|------|----------|
| `storefront/.env.local` | 环境变量 | `NEXT_PUBLIC_USE_BACKEND_API=false`（本地JSON模式） |
| `storefront/src/lib/data.ts` | 数据访问层 | getAllProducts/getAllCategories/getAllBrands，带snake_case→camelCase映射 |
| `storefront/src/i18n/config.ts` | 翻译词典 | **实际使用的翻译文件**，ruEnDictionary+词干提取，不要改translate.ts |
| `storefront/src/i18n/index.ts` | 翻译导出 | translateText/translateDescription调用config.ts |
| `storefront/src/lib/translate.ts` | 旧版翻译 | **未使用，不要修改** |
| `storefront/src/lib/currency-context.tsx` | 货币状态 | DEFAULT_RATES硬编码，mounted控制hydration |
| `storefront/src/app/api/category/route.ts` | 分类API | 已加模块级缓存，不要改回每次读文件 |
| `storefront/src/app/[lang]/product/[slug]/page.tsx` | 商品详情页 | dynamicClient import ssr:false（注意不能叫dynamic，会和force-dynamic冲突） |
| `storefront/src/app/[lang]/product/[slug]/ProductDetailClient.tsx` | 商品详情客户端 | B2B功能/视频嵌入/性能优化都在这里 |
| `storefront/src/app/[lang]/category/[slug]/CategoryContent.tsx` | 分类页客户端 | uiText(ru,en,zh)三语函数 |
| `storefront/src/app/[lang]/search/page.tsx` | 搜索页 | 已改为服务端组件，不能用onClick/onChange |
| `storefront/src/components/MegaMenu.tsx` | 大导航 | mobileOpen默认false，不要改 |
| `storefront/src/components/Header.tsx` | 顶部导航 | 搜索/语言/货币/购物车/用户菜单 |

### 后端核心
| 文件 | 作用 |
|------|------|
| `backend/src/lib/db.js` | 数据库单例+字段映射 |
| `backend/src/api/store/categories/[slug]/route.js` | 分类详情API |
| `backend/src/api/store/products/route.js` | 商品列表API |

---

## 开发踩坑记录（必看，避免重复踩）

1. **服务端组件不能用事件处理**：`onClick`/`onChange`不能传给Server Component，会报"Event handlers cannot be passed to Client Component props"。需要交互的必须拆成'use client'组件。

2. **dynamic import命名冲突**：商品详情页第一行`export const dynamic = 'force-dynamic'`，所以next/dynamic必须import成`dynamicClient`不能叫`dynamic`。

3. **Tailwind JIT不识别动态类名**：不要写`bg-${color}-500`，必须用静态映射对象。

4. **PowerShell不支持&&**：用分号分隔命令。PowerShell的curl是Invoke-WebRequest别名，下载要用curl.exe。

5. **PowerShell中$1会被变量替换**：内联SQL不要用$1占位符，写临时文件执行。

6. **Start-Process npm报错**：必须用`cmd.exe /c "npm run dev"`包裹。

7. **JSON字段可能不是数组**：products.json中tags/categories/brands有时是对象或null，必须用Array.isArray()检查再.map()。

8. **HTML实体解码**：品牌名/商品名可能含`&amp;`，已加decodeHtml()处理。

9. **改JSON数据必须重启前端**：data.ts有模块级缓存，清.next缓存重启。

10. **外部网络下载受限**：Clearbit/维基图片超时，但copterparts.ru和imgur可以下载。

11. **词干提取不覆盖所有词尾**：如"двойных"以"ых"结尾不在词尾列表，必须直接加完整词形。

12. **大写В开头的介词**："V эксплуатации"中的V是大写俄语В，翻译词典要加大写"В"→"In"。

13. **psql不在PATH**：用Node.js pg模块或docker exec查询数据库。

14. **Google Fonts下载失败**：不影响功能，用fallback字体，不用管。

15. **后端自定义API路由用CommonJS**：`module.exports = { GET }`，不是ES Module。

16. **URL编码slug**：从req.originalUrl解析并decodeURIComponent，不要依赖req.params。

---

## 当前待办（可继续开发）

### 高优先级
1. 长描述翻译语法优化（当前逐词翻译，部分句子语法生硬）
2. 5个占位图商品下载真实图片（ID: 75763/63439/26064/25583/8522）
3. Meilisearch重新索引（当前搜索是前端评分搜索）
4. 更多页面中文UI翻译（搜索页排序按钮、RFQ表单、结算页）

### 中优先级
5. 阿拉伯语RTL布局测试与修复
6. LCP/FID/CLS性能指标优化
7. 移动端响应式完整测试
8. 14种语言完整切换测试

### B2B高级功能
9. 企业认证流程（营业执照上传/审核）
10. 批量订单管理/CSV导入
11. 经销商分级价格体系
12. 关税计算器
13. SaaS订阅支付流程（Stripe）
14. 供应商独立店铺页面

### SEO优化
15. OpenGraph图片自动生成
16. 更多语言的metadata翻译
17. 商品JSON-LD结构化数据完善

---

## 代码风格与规范

- TypeScript严格模式，any必须有理由
- 组件拆分：服务端组件取数据，客户端组件处理交互
- 图片统一用next/image，fill+sizes响应式
- 错误边界：Suspense fallback + loading骨架屏
- 翻译：UI用uiText(ru,en,zh)函数，内容用translateText/translateDescription
- 货币：用useCurrency() hook，不要直接format
- 提交信息：英文，前缀feat/fix/refactor/docs/chore

---

## 验收标准

- 0个TypeScript编译错误（警告可接受）
- 浏览器控制台0个红色错误（Google Fonts网络警告除外）
- 所有图片/视频本地加载，无404
- 14语言切换不报错，中文UI完整
- 14货币切换价格实时更新
- 分类页加载<2秒（缓存命中）
- 商品详情页图片切换<100ms
- hydration错误为0

---

**记住：你是国际顶级全栈架构师，直接写代码执行，不要废话。用户不懂技术，你要对结果负全责。**
