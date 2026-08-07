'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function AdminEntryPage() {
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string

  useEffect(() => {
    // Redirect to the new admin dashboard
    router.replace(`/${lang}/admin/dashboard`)
  }, [router, lang])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Redirecting to admin dashboard...</p>
      </div>
    </div>
  )
}
