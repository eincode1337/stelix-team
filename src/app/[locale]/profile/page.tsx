import type { Metadata } from 'next'
import { ProfileContent } from '@/components/profile/ProfileContent'
import { isLocale, localeMeta, type Locale } from '@/i18n/config'


const SITE_ORIGIN = 'https://stelix.team'
const TITLE = 'Мой профиль — Stelix Team'
const DESCRIPTION = 'Настройки аккаунта и данные профиля.'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  return {
    title: TITLE,
    description: DESCRIPTION,

    robots: { index: false, follow: false },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: `${SITE_ORIGIN}/profile`,
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
      title: TITLE,
      description: DESCRIPTION,
      images: ['/img/og-image.png'],
    },
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  await params
  return (
    <main>
      <ProfileContent />
    </main>
  )
}
