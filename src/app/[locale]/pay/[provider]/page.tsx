import type { Metadata } from 'next'
import { PayContent } from '@/components/pay/PayContent'
import { isLocale, localeMeta, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'


const SITE_ORIGIN = 'https://stelix.team'
const TITLE = 'Оплата — Stelix Team'
const DESCRIPTION = 'Подтверждение платежа.'

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
      url: `${SITE_ORIGIN}/pay`,
      siteName: 'Stelix Team',
      locale: localeMeta[loc].ogLocale,
      type: 'website',
    },
  }
}


function one(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; provider: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { provider } = await params
  const sp = await searchParams
  return (
    <main>
      <PayContent
        provider={provider}
        paymentId={one(sp.paymentId)}
        amount={one(sp.amount)}
        currency={one(sp.currency) || 'RUB'}
        redirect={one(sp.redirect) || undefined}
        purchaseId={one(sp.purchaseId) || undefined}
      />
    </main>
  )
}
