import type { Metadata } from 'next'
import { SubscriptionsHero } from '@/components/subscriptions/SubscriptionsHero'
import { SubscriptionsCatalogShell } from '@/components/subscriptions/SubscriptionsCatalogShell'
import { localeMeta, isLocale, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'

const SITE_ORIGIN = 'https://stelix.team'
const TITLE = 'Подписки сервисов — Stelix Team'
const DESCRIPTION = 'Каталог подписок на сервисы: сроки, цена и автопродление.'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  const title = t(loc, TITLE)
  const description = t(loc, DESCRIPTION)
  return {
    title,
    description,
    alternates: {
      canonical: `/${loc}/subscriptions`,
      languages: {
        ru: '/ru/subscriptions',
        uk: '/uk/subscriptions',
        en: '/en/subscriptions',
        'x-default': `${SITE_ORIGIN}/subscriptions`,
      },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${SITE_ORIGIN}/subscriptions`,
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

export default async function SubscriptionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  return (
    <main>
      <SubscriptionsHero locale={loc} />
      <SubscriptionsCatalogShell locale={loc} />
    </main>
  )
}
