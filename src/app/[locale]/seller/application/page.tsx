import { CreateResourceContent, SELLER_FAQ } from '@/components/seller/CreateResourceContent'
import { t } from '@/i18n/t'

export default async function SellerApplicationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params


  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SELLER_FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: t(locale, q),
      acceptedAnswer: { '@type': 'Answer', text: t(locale, a) },
    })),
  }

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <section className="container">
        <CreateResourceContent locale={locale} />
      </section>
    </main>
  )
}
