'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Building2, Phone, Globe, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth, UserRole } from '@/lib/auth-context'
import { LanguageCode } from '@/i18n'

export default function RegisterPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    phone: '',
    country: '',
    role: 'buyer' as UserRole,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await register(formData)
    setLoading(false)

    if (result.success) {
      router.push(`/${lang}/account`)
    } else {
      setError(result.error || 'Registration failed')
    }
  }

  const update = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">A</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lang === 'ru' ? 'Создать аккаунт' : lang === 'zh' ? '创建账户' : 'Create Account'}
            </h1>
            <p className="text-gray-500 mt-2">
              {lang === 'ru' ? 'Присоединяйтесь к платформе Aegisky' : lang === 'zh' ? '加入Aegisky平台' : 'Join the Aegisky platform'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => update('role', 'buyer')}
              className={`p-4 border-2 rounded-xl text-center transition ${
                formData.role === 'buyer'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🛒</div>
              <div className="font-medium text-gray-900 text-sm">
                {lang === 'ru' ? 'Покупатель' : lang === 'zh' ? '买家' : 'Buyer'}
              </div>
            </button>
            <button
              type="button"
              onClick={() => update('role', 'supplier')}
              className={`p-4 border-2 rounded-xl text-center transition ${
                formData.role === 'supplier'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🏭</div>
              <div className="font-medium text-gray-900 text-sm">
                {lang === 'ru' ? 'Поставщик' : lang === 'zh' ? '供应商' : 'Supplier'}
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'ru' ? 'Имя *' : lang === 'zh' ? '姓名 *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => update('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'ru' ? 'Компания' : lang === 'zh' ? '公司' : 'Company'}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => update('company', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'ru' ? 'Email *' : lang === 'zh' ? '邮箱 *' : 'Email *'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'ru' ? 'Пароль *' : lang === 'zh' ? '密码 *' : 'Password *'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'ru' ? 'Телефон' : lang === 'zh' ? '电话' : 'Phone'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'ru' ? 'Страна' : lang === 'zh' ? '国家' : 'Country'}
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => update('country', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {lang === 'ru' ? 'Регистрация...' : lang === 'zh' ? '注册中...' : 'Creating account...'}
                </>
              ) : (
                lang === 'ru' ? 'Зарегистрироваться' : lang === 'zh' ? '创建账户' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {lang === 'ru' ? 'Уже есть аккаунт?' : lang === 'zh' ? '已有账户？' : 'Already have an account?'}{' '}
            <Link href={`/${lang}/login`} className="text-blue-600 font-medium hover:underline">
              {lang === 'ru' ? 'Войти' : lang === 'zh' ? '登录' : 'Sign in'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
