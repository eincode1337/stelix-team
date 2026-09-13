import type { Metadata } from 'next'
import { SubscriptionCreateContent } from '@/components/subscriptions/SubscriptionCreateContent'
import { isLocale, localeMeta, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'


const SITE_ORIGIN = 'https://stelix.team'
const TITLE = 'Новый сервис — Stelix Team'
const DESCRIPTION = 'Создание сервиса с настраиваемыми сроками подписки.'

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
      url: `${SITE_ORIGIN}/subscriptions/create`,
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

export default async function SubscriptionCreatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  return (
    <main>
      <SubscriptionCreateContent locale={loc} />
    </main>
  )
}
