import type { Metadata } from 'next'
import { AddResourceContent } from '@/components/resources/AddResourceContent'
import { isLocale, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  return {
    title: t(loc, 'Создание ресурса — Stelix Team'),
    description: t(loc, 'Новая карточка цифрового ресурса: описание, цена и условия.'),
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      title: t(loc, 'Создание ресурса — Stelix Team'),
      description: t(loc, 'Новая карточка цифрового ресурса: описание, цена и условия.'),
      url: 'https://stelix.team/resource/create',
      siteName: 'Stelix Team',
    },
  }
}

export default async function ResourceCreatePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await params
  return (
    <main>
      <AddResourceContent skipSellerHub />
    </main>
  )
}
