import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import '@/styles/stelix.css'
import { SiteBootstrapScripts } from '@/components/shell/SiteBootstrapScripts'
import { Navbar } from '@/components/shell/Navbar'
import { Footer } from '@/components/shell/Footer'
import { ScrollToTopFab } from '@/components/shell/ScrollToTopFab'
import { ShellProvider } from '@/components/shell/ShellProvider'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { locales, localeMeta, isLocale, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'

const SITE_ORIGIN = 'https://stelix.team'
const TITLE = 'Stelix Team — площадка цифровых ресурсов и заказов'
const DESCRIPTION =
  'Площадка цифровых ресурсов и заказов. Плагины, скрипты, модули, шаблоны, карты и услуги разработчиков в одном месте.'


const MANIFEST =
  'data:application/manifest+json,%7B%22name%22%3A%22Stelix%20Team%22%2C%22short_name%22%3A%22Stelix%20Team%22%2C%22description%22%3A%22Stelix%20Team%20%E2%80%94%20%D0%BF%D0%BB%D0%BE%D1%89%D0%B0%D0%B4%D0%BA%D0%B0%20%D1%86%D0%B8%D1%84%D1%80%D0%BE%D0%B2%D1%8B%D1%85%20%D1%80%D0%B5%D1%81%D1%83%D1%80%D1%81%D0%BE%D0%B2%20%D0%B8%20%D0%B7%D0%B0%D0%BA%D0%B0%D0%B7%D0%BE%D0%B2.%22%2C%22start_url%22%3A%22%2F%22%2C%22display%22%3A%22standalone%22%2C%22background_color%22%3A%22%230d1117%22%2C%22theme_color%22%3A%22%230d1117%22%2C%22icons%22%3A%5B%7B%22src%22%3A%22%2Ficon-192.png%22%2C%22sizes%22%3A%22192x192%22%2C%22type%22%3A%22image%2Fpng%22%7D%2C%7B%22src%22%3A%22%2Ficon-512.png%22%2C%22sizes%22%3A%22512x512%22%2C%22type%22%3A%22image%2Fpng%22%7D%5D%7D'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  const title = t(loc, TITLE)
  const description = t(loc, DESCRIPTION)
  const ogDescription = t(loc, 'Покупайте цифровые ресурсы, размещайте заказы и находите исполнителей на Stelix Team.')
  return {
    metadataBase: new URL(SITE_ORIGIN),
    title,
    description,
    manifest: MANIFEST,
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: {
      canonical: `/${loc}`,
      languages: {
        ru: '/ru',
        uk: '/uk',
        en: '/en',
        'x-default': SITE_ORIGIN,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', type: 'image/x-icon' },
      ],
      apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
    },
    openGraph: {
      title,
      description: ogDescription,
      url: SITE_ORIGIN,
      locale: localeMeta[loc].ogLocale,
      alternateLocale: ['uk_UA', 'en_GB'],
      images: [
        { url: '/img/og-image.png', width: 1200, height: 630, alt: 'Stelix Team — Marketplace Solutions · API Power · Grow Together' },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Stelix Team`,
      description: ogDescription,
      images: ['/img/twitter-image.png'],
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <html
      lang={localeMeta[locale].htmlLang}
      data-nav-form-factor="desktop"
      data-oauth-public-base="https://stelix.team"
      data-uploads-public-base="https://cdn.stelix.team"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://cdn.stelix.team" />
        <SiteBootstrapScripts />
      </head>
      <body className="layout-body">
        <div hidden />
        <div className="TopPageLoaderBar-module__M16D9a__track " aria-hidden="true" />
        <section className="Toastify" aria-live="polite" aria-atomic="false" aria-relevant="additions text" aria-label="Уведомления" />
        <section className="Toastify" id="oauth-link" aria-live="polite" aria-atomic="false" aria-relevant="additions text" aria-label="Уведомления при привязке аккаунта" />
        <LocaleProvider locale={locale}>
          <AuthProvider>
            <ShellProvider>
              <div className="layout-shell">
                <Navbar />
                <div className="layout-root" vt-name="page-root" vt-update="none" vt-share="page-fade">
                  {children}
                </div>
                <Footer />
              </div>
              <ScrollToTopFab />
            </ShellProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
