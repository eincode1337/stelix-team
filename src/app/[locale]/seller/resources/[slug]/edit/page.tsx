import type { Metadata } from 'next'
import { EditResourceForm } from '@/components/resources/EditResourceForm'
import { isLocale, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  return {
    title: t(loc, 'Редактирование ресурса'),
    robots: { index: false, follow: false },
  }
}

export default async function EditResourcePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params
  return <EditResourceForm slug={slug} />
}
