import type { Metadata } from 'next'
import { HeroSpace } from '@/components/home/HeroSpace'
import { ResourcesCatalog } from '@/components/resources/ResourcesCatalog'
import { localeMeta, isLocale, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'

const SITE_ORIGIN = 'https://stelix.team'
const TITLE = 'Цифровые ресурсы — Stelix Team'
const DESCRIPTION = 'Каталог цифровых ресурсов: плагины, скрипты, модули, шаблоны, карты и интеграции.'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; filter?: string[] }>
}): Promise<Metadata> {
  const { locale, filter } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  const suffix = filter && filter.length ? '/' + filter.join('/') : ''
  const title = t(loc, TITLE)
  const description = t(loc, DESCRIPTION)
  return {
    title,
    description,
    alternates: {
      canonical: `/${loc}/resources${suffix}`,
      languages: {
        ru: `/ru/resources${suffix}`,
        uk: `/uk/resources${suffix}`,
        en: `/en/resources${suffix}`,
        'x-default': `${SITE_ORIGIN}/resources${suffix}`,
      },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${SITE_ORIGIN}/resources${suffix}`,
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

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string; filter?: string[] }>
}) {
  const { filter } = await params
  const kind = filter?.[0] === 'free' ? 'FREE' : filter?.[0] === 'paid' ? 'PAID' : undefined
  const game = filter && filter.length > 1 ? filter[1] : undefined
  return (
    <main>
      <HeroSpace />
      <ResourcesCatalog initialKind={kind} initialGame={game} />
    </main>
  )
}
