'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { User, LogOut, ChevronDown, Package, FileText, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { LanguageCode } from '@/i18n'

export default function UserMenu({ lang }: { lang: LanguageCode }) {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!user) {
    return (
      <Link
        href={`/${lang}/login`}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
      >
        <User size={22} />
        <span className="hidden lg:inline text-sm font-medium">
          {lang === 'ru' ? 'Войти' : lang === 'zh' ? '登录' : 'Sign In'}
        </span>
      </Link>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden lg:inline text-sm font-medium max-w-[100px] truncate">{user.name}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-medium text-gray-900 text-sm truncate">{user.name}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
          <Link
            href={`/${lang}/account`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Settings size={16} />
            {lang === 'ru' ? 'Личный кабинет' : lang === 'zh' ? '我的账户' : 'My Account'}
          </Link>
          <Link
            href={`/${lang}/account`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Package size={16} />
            {lang === 'ru' ? 'Заказы' : lang === 'zh' ? '我的订单' : 'My Orders'}
          </Link>
          <Link
            href={`/${lang}/account`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <FileText size={16} />
            {lang === 'ru' ? 'RFQ запросы' : lang === 'zh' ? '我的询价' : 'My RFQs'}
          </Link>
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={16} />
              {lang === 'ru' ? 'Выйти' : lang === 'zh' ? '退出登录' : 'Logout'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
