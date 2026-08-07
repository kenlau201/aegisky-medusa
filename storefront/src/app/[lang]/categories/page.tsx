import { getAllCategories } from '@/lib/data'
import AllCategoriesClient from './AllCategoriesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Categories - Aegisky',
}

export default function CategoriesPage({ params: { lang } }: { params: { lang: string } }) {
  const categories = getAllCategories()

  return <AllCategoriesClient lang={lang as any} categories={categories} />
}
