import type { Metadata } from 'next'
import { ComboContent } from '@/components/resources/ComboContent'
import { isLocale, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'


export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  const title = t(loc, 'Создать комплект — Stelix Team')
  const description = t(loc, 'Создать комплект')
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      title,
      description,
      url: 'https://stelix.team/resource/combo/create',
      siteName: 'Stelix Team',
    },
  }
}

export default async function CreateComboPage({ params }: { params: Promise<{ locale: string }> }) {
  await params
  return (
    <main>
      <ComboContent />
    </main>
  )
}
