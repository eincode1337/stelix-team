import type { Metadata } from 'next'
import { Chat } from '@/components/chat/Chat'
import { isLocale, localeMeta, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'

const SITE_ORIGIN = 'https://stelix.team'
const TITLE = 'Чаты — Stelix Team'
const DESCRIPTION = 'Переписка по покупкам и заказам.'


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
      title,
      description,
      url: `${SITE_ORIGIN}/chat`,
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


export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await params
  const sp = await searchParams
  return (
    <main className="mainChat">
      <Chat initialSearchParams={sp} />
    </main>
  )
}
