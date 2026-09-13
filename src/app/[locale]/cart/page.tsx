import type { Metadata } from 'next'
import { Cart } from '@/components/cart/Cart'
import { localeMeta, isLocale, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'


const SITE_ORIGIN = 'https://stelix.team'
const TITLE = 'Корзина — Stelix Team'
const DESCRIPTION = 'Выбранные ресурсы перед оформлением покупки.'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  const title = t(loc, TITLE)
  const description = t(loc, DESCRIPTION)
  return {
    title,
    description,

    robots: 'noindex, nofollow',
    alternates: {
      canonical: `/${loc}/cart`,
      languages: {
        ru: '/ru/cart',
        uk: '/uk/cart',
        en: '/en/cart',
        'x-default': `${SITE_ORIGIN}/cart`,
      },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${SITE_ORIGIN}/cart`,
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

export default function CartPage() {
  return (
    <main>
      <Cart />
    </main>
  )
}
