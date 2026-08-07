'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Package, FileText, Heart, Settings, LogOut, ShoppingCart, ChevronRight, Check, Building2, Mail, Phone, Globe, TrendingUp, DollarSign, Eye, ShieldCheck, Truck } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { useRFQ, statusLabels } from '@/lib/rfq-context'
import { useOrders, orderStatusLabels } from '@/lib/order-context'
import { useCurrency } from '@/lib/currency-context'
import { LanguageCode } from '@/i18n'

export default function AccountPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  const { user, logout, updateProfile, isLoading } = useAuth()
  const { items } = useCart()
  const { getUserRFQs } = useRFQ()
  const { getUserOrders, cancelOrder } = useOrders()
  const { format } = useCurrency()
  const userRFQs = user ? getUserRFQs(user.id) : []
  const userOrders = user ? getUserOrders() : []
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'rfqs' | 'supplier' | 'profile'>('overview')
  const [editMode, setEditMode] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    company: user?.company || '',
    phone: user?.phone || '',
    country: user?.country || '',
  })

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="text-gray-400" size={36} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {lang === 'ru' ? 'Войдите в аккаунт' : lang === 'zh' ? '请登录' : 'Please sign in'}
        </h1>
        <p className="text-gray-500 mb-8">
          {lang === 'ru' ? 'Для доступа к личному кабинету' : lang === 'zh' ? '访问您的账户中心' : 'to access your account'}
        </p>
        <div className="flex flex-col gap-3">
          <Link href={`/${lang}/login`} className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            {lang === 'ru' ? 'Войти' : lang === 'zh' ? '登录' : 'Sign In'}
          </Link>
          <Link href={`/${lang}/register`} className="border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
            {lang === 'ru' ? 'Создать аккаунт' : lang === 'zh' ? '注册' : 'Create Account'}
          </Link>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push(`/${lang}`)
  }

  const handleSaveProfile = () => {
    updateProfile(profileData)
    setEditMode(false)
  }

  const menuItems = [
    { id: 'overview', icon: User, label: lang === 'ru' ? 'Обзор' : lang === 'zh' ? '概览' : 'Overview' },
    { id: 'orders', icon: Package, label: lang === 'ru' ? 'Заказы' : lang === 'zh' ? '订单' : 'Orders' },
    { id: 'rfqs', icon: FileText, label: lang === 'ru' ? 'RFQ запросы' : lang === 'zh' ? '询价' : 'RFQs' },
    ...(user.role === 'supplier' ? [{ id: 'supplier', icon: Building2, label: lang === 'ru' ? 'Панель поставщика' : lang === 'zh' ? '供应商面板' : 'Supplier Dashboard' }] : []),
    { id: 'profile', icon: Settings, label: lang === 'ru' ? 'Профиль' : lang === 'zh' ? '设置' : 'Profile' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
        {lang === 'ru' ? 'Личный кабинет' : lang === 'zh' ? '我的账户' : 'My Account'}
      </h1>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                user.role === 'supplier' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {user.role === 'supplier'
                  ? (lang === 'ru' ? 'Поставщик' : lang === 'zh' ? '供应商' : 'Supplier')
                  : (lang === 'ru' ? 'Покупатель' : lang === 'zh' ? '买家' : 'Buyer')}
              </span>
              {user.verified && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                  <Check size={12} /> {lang === 'ru' ? 'Проверен' : lang === 'zh' ? '已认证' : 'Verified'}
                </span>
              )}
            </div>
          </div>

          <nav className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition border-t border-gray-200"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">{lang === 'ru' ? 'Выйти' : lang === 'zh' ? '退出登录' : 'Logout'}</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <ShoppingCart className="text-blue-600 mb-3" size={28} />
                  <div className="text-2xl font-bold text-gray-900">{items.length}</div>
                  <div className="text-sm text-gray-500">{lang === 'ru' ? 'В корзине' : lang === 'zh' ? '购物车商品' : 'Cart Items'}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <Package className="text-green-600 mb-3" size={28} />
                  <div className="text-2xl font-bold text-gray-900">{userOrders.length}</div>
                  <div className="text-sm text-gray-500">{lang === 'ru' ? 'Заказов' : lang === 'zh' ? '订单' : 'Orders'}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <FileText className="text-purple-600 mb-3" size={28} />
                  <div className="text-2xl font-bold text-gray-900">{userRFQs.length}</div>
                  <div className="text-sm text-gray-500">{lang === 'ru' ? 'RFQ запросов' : lang === 'zh' ? '询价单' : 'RFQs'}</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {lang === 'ru' ? 'Быстрые действия' : lang === 'zh' ? '快捷操作' : 'Quick Actions'}
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Link href={`/${lang}/cart`} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
                    <ShoppingCart className="text-blue-600" size={24} />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{lang === 'ru' ? 'Корзина' : lang === 'zh' ? '购物车' : 'View Cart'}</div>
                      <div className="text-xs text-gray-500">{items.length} {lang === 'ru' ? 'товаров' : 'items'}</div>
                    </div>
                  </Link>
                  <Link href={`/${lang}/rfq`} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
                    <FileText className="text-purple-600" size={24} />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{lang === 'ru' ? 'Новый RFQ' : lang === 'zh' ? '发起询价' : 'New RFQ'}</div>
                      <div className="text-xs text-gray-500">{lang === 'ru' ? 'Запросить цену' : 'Request a quote'}</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {lang === 'ru' ? 'Мои заказы' : lang === 'zh' ? '我的订单' : 'My Orders'}
                </h3>
                <span className="text-sm text-gray-500">{userOrders.length} {lang === 'ru' ? 'заказов' : lang === 'zh' ? '个订单' : 'orders'}</span>
              </div>
              {userOrders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                  <Package className="mx-auto text-gray-300 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {lang === 'ru' ? 'Заказов пока нет' : lang === 'zh' ? '暂无订单' : 'No orders yet'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {lang === 'ru' ? 'Начните с просмотра каталога' : lang === 'zh' ? '开始浏览产品目录' : 'Start by browsing our catalog'}
                  </p>
                  <Link href={`/${lang}/categories`} className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
                    {lang === 'ru' ? 'Перейти в каталог' : lang === 'zh' ? '浏览目录' : 'Browse Catalog'}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map(order => {
                    const statusInfo = orderStatusLabels[order.status]
                    return (
                      <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                          <div>
                            <div className="font-mono font-bold text-gray-900">{order.orderNumber}</div>
                            <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                            {(order.status === 'pending' || order.status === 'paid') && (
                              <button onClick={() => cancelOrder(order.id)} className="text-red-500 hover:text-red-700 text-sm">
                                {lang === 'ru' ? 'Отменить' : lang === 'zh' ? '取消' : 'Cancel'}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              {item.image && <img src={item.image} alt="" className="w-12 h-12 object-contain bg-gray-50 rounded" />}
                              <div className="flex-1 min-w-0">
                                <Link href={`/${lang}/product/${item.productSlug}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1">{item.productName}</Link>
                                <div className="text-xs text-gray-500">Qty: {item.quantity} × {format(item.price)}</div>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="text-sm text-gray-500">+{order.items.length - 3} more items</div>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="text-sm text-gray-500">
                            {order.shipping.carrier} • {order.payment.method.toUpperCase()}
                          </div>
                          <div className="text-lg font-bold text-gray-900">{format(order.total)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rfqs' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {lang === 'ru' ? 'Мои RFQ запросы' : lang === 'zh' ? '我的询价' : 'My RFQs'}
                </h3>
                <Link href={`/${lang}/rfq`} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  + {lang === 'ru' ? 'Новый запрос' : lang === 'zh' ? '新建询价' : 'New RFQ'}
                </Link>
              </div>
              {userRFQs.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                  <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {lang === 'ru' ? 'RFQ запросов нет' : lang === 'zh' ? '暂无询价' : 'No RFQs yet'}
                  </h4>
                  <p className="text-gray-500 mb-6">
                    {lang === 'ru' ? 'Отправьте запрос на товар' : lang === 'zh' ? '提交您的第一个询价' : 'Submit your first request for quote'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userRFQs.map((rfq) => {
                    const status = statusLabels[rfq.status]
                    const statusText = lang === 'ru' ? status.ru : lang === 'zh' ? status.zh : status.en
                    return (
                      <div key={rfq.id} className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-mono text-xs text-gray-400 mb-1">{rfq.id}</div>
                            <div className="font-medium text-gray-900">
                              {rfq.items.map(i => i.productName).join(', ')}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {statusText}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">{lang === 'ru' ? 'Количество' : lang === 'zh' ? '数量' : 'Quantity'}</div>
                            <div className="font-medium">{rfq.items.reduce((sum, i) => sum + i.quantity, 0)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">{lang === 'ru' ? 'Предложений' : lang === 'zh' ? '报价数' : 'Quotes'}</div>
                            <div className="font-medium">{rfq.quotes.length}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">{lang === 'ru' ? 'Дата' : lang === 'zh' ? '日期' : 'Date'}</div>
                            <div className="font-medium">{new Date(rfq.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">{lang === 'ru' ? 'Валюта' : lang === 'zh' ? '货币' : 'Currency'}</div>
                            <div className="font-medium">{rfq.currency}</div>
                          </div>
                        </div>
                        {rfq.quotes.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-xs text-gray-500 mb-2">
                              {lang === 'ru' ? 'Полученные предложения:' : lang === 'zh' ? '收到报价:' : 'Received quotes:'}
                            </div>
                            <div className="space-y-2">
                              {rfq.quotes.map((q) => (
                                <div key={q.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                                  <span className="font-medium">{q.supplierName}</span>
                                  <span className="text-blue-600 font-semibold">{q.price} {q.currency}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'supplier' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">
                  {lang === 'ru' ? 'Панель поставщика' : lang === 'zh' ? '供应商面板' : 'Supplier Dashboard'}
                </h3>
                <p className="text-purple-100 text-sm">
                  {user.verified
                    ? (lang === 'ru' ? 'Аккаунт подтверждён' : lang === 'zh' ? '账户已认证' : 'Verified Supplier Account')
                    : (lang === 'ru' ? 'Ожидает проверки' : lang === 'zh' ? '等待审核' : 'Pending Verification')}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <Package className="text-blue-600 mb-2" size={24} />
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">{lang === 'ru' ? 'Товаров' : lang === 'zh' ? '产品' : 'Products'}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <FileText className="text-orange-600 mb-2" size={24} />
                  <div className="text-2xl font-bold text-gray-900">{userRFQs.length}</div>
                  <div className="text-sm text-gray-500">{lang === 'ru' ? 'RFQ получено' : lang === 'zh' ? '收到询价' : 'RFQs Received'}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <DollarSign className="text-green-600 mb-2" size={24} />
                  <div className="text-2xl font-bold text-gray-900">$0</div>
                  <div className="text-sm text-gray-500">{lang === 'ru' ? 'Продажи' : lang === 'zh' ? '销售额' : 'Sales'}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <Eye className="text-purple-600 mb-2" size={24} />
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">{lang === 'ru' ? 'Просмотры' : lang === 'zh' ? '浏览量' : 'Views'}</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  {lang === 'ru' ? 'Последние RFQ' : lang === 'zh' ? '最新询价' : 'Recent RFQs'}
                </h4>
                {userRFQs.length > 0 ? (
                  <div className="space-y-3">
                    {userRFQs.slice(0, 5).map((rfq) => (
                      <div key={rfq.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{rfq.items.map(i => i.productName).join(', ')}</div>
                          <div className="text-xs text-gray-500">{new Date(rfq.createdAt).toLocaleDateString()} · Qty: {rfq.items.reduce((s, i) => s + i.quantity, 0)}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[rfq.status].color}`}>
                          {lang === 'ru' ? statusLabels[rfq.status].ru : lang === 'zh' ? statusLabels[rfq.status].zh : statusLabels[rfq.status].en}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">
                    {lang === 'ru' ? 'Пока нет RFQ запросов' : lang === 'zh' ? '暂无询价' : 'No RFQs yet'}
                  </p>
                )}
              </div>

              {!user.verified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                    <ShieldCheck size={20} />
                    {lang === 'ru' ? 'Завершите верификацию' : lang === 'zh' ? '完成认证' : 'Complete Verification'}
                  </h4>
                  <p className="text-sm text-yellow-700 mb-4">
                    {lang === 'ru'
                      ? 'Загрузите документы компании для получения статуса проверенного поставщика.'
                      : lang === 'zh'
                      ? '上传公司文件以获得认证供应商身份。'
                      : 'Upload company documents to get verified supplier status.'}
                  </p>
                  <Link href={`/${lang}/supplier`} className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition">
                    {lang === 'ru' ? 'Загрузить документы' : lang === 'zh' ? '上传文件' : 'Upload Documents'}
                  </Link>
                </div>
              )}

              {/* Order Management for Suppliers */}
              <SupplierOrderManager lang={lang} />

              {/* Product Management */}
              <SupplierProductManager lang={lang} />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">
                  {lang === 'ru' ? 'Информация профиля' : lang === 'zh' ? '个人信息' : 'Profile Information'}
                </h3>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    {lang === 'ru' ? 'Редактировать' : lang === 'zh' ? '编辑' : 'Edit'}
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {lang === 'ru' ? 'Имя' : lang === 'zh' ? '姓名' : 'Name'}
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {lang === 'ru' ? 'Компания' : lang === 'zh' ? '公司' : 'Company'}
                      </label>
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {lang === 'ru' ? 'Телефон' : lang === 'zh' ? '电话' : 'Phone'}
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {lang === 'ru' ? 'Страна' : lang === 'zh' ? '国家' : 'Country'}
                      </label>
                      <input
                        type="text"
                        value={profileData.country}
                        onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                    >
                      {lang === 'ru' ? 'Сохранить' : lang === 'zh' ? '保存' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                    >
                      {lang === 'ru' ? 'Отмена' : lang === 'zh' ? '取消' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                    <Mail className="text-gray-400" size={20} />
                    <div>
                      <div className="text-xs text-gray-500">{lang === 'ru' ? 'Email' : 'Email'}</div>
                      <div className="text-gray-900">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                    <User className="text-gray-400" size={20} />
                    <div>
                      <div className="text-xs text-gray-500">{lang === 'ru' ? 'Имя' : lang === 'zh' ? '姓名' : 'Name'}</div>
                      <div className="text-gray-900">{user.name}</div>
                    </div>
                  </div>
                  {user.company && (
                    <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                      <Building2 className="text-gray-400" size={20} />
                      <div>
                        <div className="text-xs text-gray-500">{lang === 'ru' ? 'Компания' : lang === 'zh' ? '公司' : 'Company'}</div>
                        <div className="text-gray-900">{user.company}</div>
                      </div>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                      <Phone className="text-gray-400" size={20} />
                      <div>
                        <div className="text-xs text-gray-500">{lang === 'ru' ? 'Телефон' : lang === 'zh' ? '电话' : 'Phone'}</div>
                        <div className="text-gray-900">{user.phone}</div>
                      </div>
                    </div>
                  )}
                  {user.country && (
                    <div className="flex items-center gap-3 py-3">
                      <Globe className="text-gray-400" size={20} />
                      <div>
                        <div className="text-xs text-gray-500">{lang === 'ru' ? 'Страна' : lang === 'zh' ? '国家' : 'Country'}</div>
                        <div className="text-gray-900">{user.country}</div>
                      </div>
                    </div>
                  )}

                  {/* GDPR / Data Privacy */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ShieldCheck size={20} className="text-gray-500" />
                      {lang === 'ru' ? 'Конфиденциальность данных' : lang === 'zh' ? '数据隐私' : 'Data & Privacy'}
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          const data = {
                            profile: user,
                            orders: getUserOrders(),
                            rfqs: userRFQs,
                            cart: items,
                            exportedAt: new Date().toISOString(),
                          }
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `aegisky-data-${new Date().toISOString().split('T')[0]}.json`
                          a.click()
                          URL.revokeObjectURL(url)
                        }}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition text-left"
                      >
                        <FileText className="text-blue-600" size={24} />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {lang === 'ru' ? 'Экспорт данных' : lang === 'zh' ? '导出我的数据' : 'Export My Data'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {lang === 'ru' ? 'Скачать все ваши данные (JSON)' : lang === 'zh' ? '下载您的所有数据(JSON)' : 'Download all your data (JSON)'}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(lang === 'ru' ? 'Вы уверены? Это удалит ВСЕ ваши данные без возможности восстановления.' : lang === 'zh' ? '确定吗？这将永久删除您的所有数据且无法恢复。' : 'Are you sure? This will permanently delete ALL your data.')) {
                            localStorage.removeItem('aegisky-user')
                            localStorage.removeItem('aegisky-orders')
                            localStorage.removeItem('aegisky-rfqs')
                            localStorage.removeItem('aegisky-cart')
                            localStorage.removeItem('aegisky-reviews')
                            localStorage.removeItem('aegisky-supplier-products')
                            localStorage.removeItem('aegisky-search-history')
                            logout()
                            router.push(`/${lang}`)
                          }
                        }}
                        className="flex items-center gap-3 p-4 border border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50/30 transition text-left"
                      >
                        <TrendingUp className="text-red-600 rotate-180" size={24} />
                        <div>
                          <div className="font-medium text-red-700 text-sm">
                            {lang === 'ru' ? 'Удалить аккаунт' : lang === 'zh' ? '删除我的账户' : 'Delete My Account'}
                          </div>
                          <div className="text-xs text-red-500">
                            {lang === 'ru' ? 'Безвозвратно удалить все данные' : lang === 'zh' ? '永久删除所有数据' : 'Permanently remove all data'}
                          </div>
                        </div>
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                      {lang === 'ru'
                        ? 'В соответствии с GDPR вы имеете право на доступ, экспорт и удаление ваших персональных данных.'
                        : lang === 'zh'
                        ? '根据GDPR法规，您有权访问、导出和删除您的个人数据。'
                        : 'Under GDPR, you have the right to access, export, and delete your personal data.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== Supplier Product Manager ====================
interface SupplierProduct {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  category: string
  status: 'active' | 'draft' | 'pending'
  image?: string
}

function SupplierProductManager({ lang }: { lang: LanguageCode }) {
  const { format } = useCurrency()
  const [showAddForm, setShowAddForm] = useState(false)
  const [products, setProducts] = useState<SupplierProduct[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem('aegisky-supplier-products')
      return data ? JSON.parse(data) : []
    } catch { return [] }
  })
  const [form, setForm] = useState({ name: '', sku: '', price: '', stock: '', category: '', description: '' })

  const saveProducts = (newProducts: SupplierProduct[]) => {
    setProducts(newProducts)
    localStorage.setItem('aegisky-supplier-products', JSON.stringify(newProducts))
  }

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault()
    const newProduct: SupplierProduct = {
      id: 'sp_' + Date.now(),
      name: form.name,
      sku: form.sku,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      category: form.category,
      status: 'pending',
    }
    saveProducts([newProduct, ...products])
    setForm({ name: '', sku: '', price: '', stock: '', category: '', description: '' })
    setShowAddForm(false)
  }

  const toggleStatus = (id: string) => {
    saveProducts(products.map(p =>
      p.id === id ? { ...p, status: p.status === 'active' ? 'draft' : 'active' } : p
    ))
  }

  const deleteProduct = (id: string) => {
    saveProducts(products.filter(p => p.id !== id))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">
          {lang === 'ru' ? 'Управление товарами' : lang === 'zh' ? '商品管理' : 'Product Management'}
        </h4>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          {showAddForm ? (lang === 'ru' ? 'Отмена' : lang === 'zh' ? '取消' : 'Cancel') : `+ ${lang === 'ru' ? 'Добавить товар' : lang === 'zh' ? '添加商品' : 'Add Product'}`}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProduct} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {lang === 'ru' ? 'Название товара' : lang === 'zh' ? '商品名称' : 'Product Name'} *
              </label>
              <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SKU *</label>
              <input type="text" required value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {lang === 'ru' ? 'Цена (RUB)' : lang === 'zh' ? '价格(RUB)' : 'Price (RUB)'} *
              </label>
              <input type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {lang === 'ru' ? 'Остаток' : lang === 'zh' ? '库存' : 'Stock'} *
              </label>
              <input type="number" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {lang === 'ru' ? 'Категория' : lang === 'zh' ? '分类' : 'Category'}
              </label>
              <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
            {lang === 'ru' ? 'Опубликовать' : lang === 'zh' ? '发布' : 'Submit Product'}
          </button>
        </form>
      )}

      {products.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          {lang === 'ru' ? 'У вас пока нет товаров. Нажмите "Добавить товар" чтобы начать продавать.' : lang === 'zh' ? '暂无商品，点击"添加商品"开始销售。' : 'No products yet. Click "Add Product" to start selling.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-3 font-medium">{lang === 'ru' ? 'Товар' : lang === 'zh' ? '商品' : 'Product'}</th>
                <th className="pb-3 font-medium">SKU</th>
                <th className="pb-3 font-medium">{lang === 'ru' ? 'Цена' : lang === 'zh' ? '价格' : 'Price'}</th>
                <th className="pb-3 font-medium">{lang === 'ru' ? 'Остаток' : lang === 'zh' ? '库存' : 'Stock'}</th>
                <th className="pb-3 font-medium">{lang === 'ru' ? 'Статус' : lang === 'zh' ? '状态' : 'Status'}</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="py-3 text-gray-900">{format(Number(p.price))}</td>
                  <td className="py-3 text-gray-600">{p.stock}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === 'active' ? 'bg-green-100 text-green-700' :
                      p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {p.status === 'active' ? (lang === 'ru' ? 'Активен' : lang === 'zh' ? '在售' : 'Active') :
                       p.status === 'pending' ? (lang === 'ru' ? 'На модерации' : lang === 'zh' ? '审核中' : 'Pending') :
                       (lang === 'ru' ? 'Черновик' : lang === 'zh' ? '草稿' : 'Draft')}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => toggleStatus(p.id)} className="text-blue-600 hover:underline text-xs mr-3">
                      {p.status === 'active' ? (lang === 'ru' ? 'Скрыть' : lang === 'zh' ? '下架' : 'Hide') : (lang === 'ru' ? 'Опубликовать' : lang === 'zh' ? '上架' : 'Publish')}
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:underline text-xs">
                      {lang === 'ru' ? 'Удалить' : lang === 'zh' ? '删除' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ==================== Supplier Order Manager ====================
function SupplierOrderManager({ lang }: { lang: LanguageCode }) {
  const { getAllOrders, updateOrderStatus, updateTrackingNumber } = useOrders()
  const { format } = useCurrency()
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [trackingForm, setTrackingForm] = useState<{ orderId: string; carrier: string; tracking: string } | null>(null)
  const [filter, setFilter] = useState<'all' | 'paid' | 'processing' | 'shipped'>('all')

  const allOrders = getAllOrders()
  const filteredOrders = filter === 'all' ? allOrders : allOrders.filter(o => o.status === filter)

  const handleShip = (orderId: string) => {
    if (!trackingForm || trackingForm.orderId !== orderId) return
    updateTrackingNumber(orderId, trackingForm.tracking, trackingForm.carrier)
    setTrackingForm(null)
  }

  const handleMarkPaid = (orderId: string) => {
    updateOrderStatus(orderId, 'paid', 'Payment confirmed by supplier')
  }

  const handleMarkProcessing = (orderId: string) => {
    updateOrderStatus(orderId, 'processing', 'Order processing')
  }

  if (allOrders.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">
          {lang === 'ru' ? 'Заказы покупателей' : lang === 'zh' ? '客户订单' : 'Customer Orders'}
        </h4>
        <p className="text-gray-500 text-sm text-center py-6">
          {lang === 'ru' ? 'Заказов пока нет' : lang === 'zh' ? '暂无订单' : 'No orders yet'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h4 className="font-semibold text-gray-900">
          {lang === 'ru' ? 'Заказы покупателей' : lang === 'zh' ? '客户订单' : 'Customer Orders'}
        </h4>
        <div className="flex gap-1">
          {(['all', 'paid', 'processing', 'shipped'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? (lang === 'ru' ? 'Все' : lang === 'zh' ? '全部' : 'All') :
               f === 'paid' ? (lang === 'ru' ? 'Оплачены' : lang === 'zh' ? '已付款' : 'Paid') :
               f === 'processing' ? (lang === 'ru' ? 'В обработке' : lang === 'zh' ? '处理中' : 'Processing') :
               (lang === 'ru' ? 'Отправлены' : lang === 'zh' ? '已发货' : 'Shipped')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredOrders.map(order => {
          const statusInfo = orderStatusLabels[order.status]
          const isExpanded = expandedOrder === order.id
          return (
            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-mono font-bold text-sm text-gray-900">{order.orderNumber}</div>
                    <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {lang === 'ru' ? statusInfo.ru : lang === 'zh' ? statusInfo.zh : statusInfo.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{format(order.total)}</div>
                  <div className="text-xs text-gray-500">{order.items.length} items</div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                  {/* Customer info */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900 mb-1">
                        {lang === 'ru' ? 'Покупатель' : lang === 'zh' ? '客户信息' : 'Customer'}
                      </div>
                      <div className="text-gray-600">
                        {order.shippingAddress.fullName}<br />
                        {order.shippingAddress.company && <>{order.shippingAddress.company}<br /></>}
                        {order.shippingAddress.email}<br />
                        {order.shippingAddress.phone}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">
                        {lang === 'ru' ? 'Адрес доставки' : lang === 'zh' ? '配送地址' : 'Shipping Address'}
                      </div>
                      <div className="text-gray-600">
                        {order.shippingAddress.address}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                        {order.shippingAddress.country}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <div className="font-medium text-gray-900 mb-2 text-sm">
                      {lang === 'ru' ? 'Товары' : lang === 'zh' ? '商品' : 'Items'}
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          {item.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt="" className="w-10 h-10 object-contain bg-white rounded" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-900 truncate">{item.productName}</div>
                            <div className="text-xs text-gray-500">SKU: {item.sku} · Qty: {item.quantity}</div>
                          </div>
                          <div className="font-medium">{format(item.price * item.quantity)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                    {order.status === 'pending' && (
                      <button onClick={() => handleMarkPaid(order.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                        {lang === 'ru' ? 'Подтвердить оплату' : lang === 'zh' ? '确认付款' : 'Confirm Payment'}
                      </button>
                    )}
                    {(order.status === 'paid') && (
                      <button onClick={() => handleMarkProcessing(order.id)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
                        {lang === 'ru' ? 'Начать обработку' : lang === 'zh' ? '开始处理' : 'Start Processing'}
                      </button>
                    )}
                    {(order.status === 'paid' || order.status === 'processing') && (
                      <button onClick={() => setTrackingForm({ orderId: order.id, carrier: 'DHL', tracking: '' })} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                        {lang === 'ru' ? 'Отправить' : lang === 'zh' ? '发货' : 'Ship Order'}
                      </button>
                    )}
                    {order.shipping.trackingNumber && (
                      <div className="text-sm text-gray-600 flex items-center gap-2 ml-auto">
                        <Truck size={16} />
                        {order.shipping.carrier}: <span className="font-mono font-medium">{order.shipping.trackingNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Tracking form */}
                  {trackingForm?.orderId === order.id && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="font-medium text-sm text-gray-900 mb-3">
                        {lang === 'ru' ? 'Информация об отправке' : lang === 'zh' ? '发货信息' : 'Shipment Information'}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <select
                          value={trackingForm.carrier}
                          onChange={e => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="DHL">DHL Express</option>
                          <option value="FedEx">FedEx</option>
                          <option value="UPS">UPS</option>
                          <option value="EMS">EMS</option>
                          <option value="China Post">China Post</option>
                        </select>
                        <input
                          type="text"
                          placeholder={lang === 'ru' ? 'Номер отслеживания' : lang === 'zh' ? '物流单号' : 'Tracking number'}
                          value={trackingForm.tracking}
                          onChange={e => setTrackingForm({ ...trackingForm, tracking: e.target.value })}
                          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button onClick={() => handleShip(order.id)} disabled={!trackingForm.tracking}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                          {lang === 'ru' ? 'Подтвердить' : lang === 'zh' ? '确认发货' : 'Confirm Shipment'}
                        </button>
                        <button onClick={() => setTrackingForm(null)} className="px-4 py-2 text-gray-600 text-sm hover:underline">
                          {lang === 'ru' ? 'Отмена' : lang === 'zh' ? '取消' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
