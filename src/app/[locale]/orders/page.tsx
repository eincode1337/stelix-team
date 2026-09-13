import type { Metadata } from 'next'
import { OrdersHero } from '@/components/orders/OrdersHero'
import { OrdersSuspenseShell } from '@/components/orders/OrdersSuspenseShell'
import { isLocale, localeMeta, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'

const SITE_ORIGIN = 'https://stelix.team'
const TITLE = 'Цифровые заказы — Stelix Team'
const DESCRIPTION = 'Список заказов: статусы, бюджет и отклики исполнителей.'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  const title = t(loc, TITLE)
  const description = t(loc, DESCRIPTION)
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${loc}/orders`,
      languages: {
        ru: '/ru/orders',
        uk: '/uk/orders',
        en: '/en/orders',
        'x-default': `${SITE_ORIGIN}/orders`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_ORIGIN}/orders`,
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


export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  return (
    <main>
      <OrdersHero locale={loc} />
      <OrdersSuspenseShell locale={loc} />
    </main>
  )
}
