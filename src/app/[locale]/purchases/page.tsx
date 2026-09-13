import type { Metadata } from 'next'
import { PurchasesList } from '@/components/purchases/PurchasesList'
import { isLocale, localeMeta, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'

const SITE_ORIGIN = 'https://stelix.team'
const TITLE = 'Мои покупки — Stelix Team'
const DESCRIPTION = 'История покупок и статусы выдачи.'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  const title = t(loc, TITLE)
  const description = t(loc, DESCRIPTION)
  return {
    title,
    description,

    robots: { index: false, follow: false },
    alternates: {
      canonical: `/${loc}/purchases`,
      languages: {
        ru: '/ru/purchases',
        uk: '/uk/purchases',
        en: '/en/purchases',
        'x-default': `${SITE_ORIGIN}/purchases`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_ORIGIN}/purchases`,
      siteName: 'Stelix Team',
      locale: localeMeta[loc].ogLocale,
      alternateLocale: ['uk_UA', 'en_GB'],
      type: 'website',
      images: [
        {
          url: '/img/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Stelix Team — Marketplace Solutions · API Power · Grow Together',
        },
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


export default async function PurchasesPage({ params }: { params: Promise<{ locale: string }> }) {
  await params
  return (
    <main>
      <PurchasesList />
    </main>
  )
}
