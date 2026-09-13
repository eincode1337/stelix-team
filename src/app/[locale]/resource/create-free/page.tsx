import type { Metadata } from 'next'
import { CreateFreeResourceContent } from '@/components/resources/CreateFreeResourceContent'
import { localeMeta, isLocale, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'

const SITE_ORIGIN = 'https://stelix.team'
const TITLE = 'Создание бесплатного ресурса — Stelix Team'
const DESCRIPTION = 'Новая карточка бесплатного ресурса: описание и условия скачивания.'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  const title = t(loc, TITLE)
  const description = t(loc, DESCRIPTION)
  return {
    title,
    description,

    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${SITE_ORIGIN}/resource/create-free`,
      siteName: 'Stelix Team',
      locale: localeMeta[loc].ogLocale,
      alternateLocale: ['uk_UA', 'en_GB'],
      images: [
        { url: '/img/og-image.png', width: 1200, height: 630, alt: 'Stelix Team — Marketplace Solutions · API Power · Grow Together' },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/img/og-image.png'],
    },
  }
}


export default async function CreateFreeResourcePage({ params }: { params: Promise<{ locale: string }> }) {
  await params

  return (
    <main>
      <CreateFreeResourceContent />
    </main>
  )
}
