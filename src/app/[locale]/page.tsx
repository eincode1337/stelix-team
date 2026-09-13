import { HeroSpace } from '@/components/home/HeroSpace'
import { ResourcesCatalog } from '@/components/resources/ResourcesCatalog'
import { isLocale, type Locale } from '@/i18n/config'

const SITE = 'https://stelix.team'

const NAV = [
  {
    path: 'resources',
    name: 'Цифровые ресурсы',
    description: 'Каталог цифровых ресурсов: плагины, скрипты, модули, шаблоны, карты и интеграции.',
  },
  {
    path: 'orders',
    name: 'Цифровые заказы',
    description: 'Список заказов: статусы, бюджет и отклики исполнителей.',
  },
  {
    path: 'subscriptions',
    name: 'Подписки сервисов',
    description: 'Каталог подписок на сервисы: сроки, цена и автопродление.',
  },
  {
    path: 'seller/application',
    name: 'Зарабатывайте на своих разработках',
    description:
      'Площадка для продажи плагинов, модов, скриптов и других IT-разработок. Заявка бесплатно, комиссия 3% с продажи, автовыдача и выплаты на карту.',
  },
]

function jsonLd(locale: Locale) {
  const base = `${SITE}/${locale}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: 'Stelix Team',
        description:
          'Площадка цифровых ресурсов и заказов. Плагины, скрипты, модули, шаблоны, карты и услуги разработчиков в одном месте.',
        inLanguage: ['ru-RU', 'uk-UA', 'en-GB'],
        publisher: { '@id': `${SITE}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'Stelix Team',
        url: `${SITE}/`,
        logo: {
          '@type': 'ImageObject',
          '@id': `${SITE}/#logo`,
          url: `${SITE}/icons/stelixteam_light.svg`,
          contentUrl: `${SITE}/icons/stelixteam_light.svg`,
          width: 1740,
          height: 183,
        },
        image: { '@id': `${SITE}/#logo` },
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE}/#primary-nav`,
        name: 'Stelix Team — площадка цифровых ресурсов и заказов',
        itemListElement: NAV.map((entry, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'SiteNavigationElement',
            '@id': `${base}/${entry.path}#nav`,
            name: entry.name,
            description: entry.description,
            url: `${base}/${entry.path}`,
            isPartOf: { '@id': `${SITE}/#website` },
            position: index + 1,
          },
        })),
      },
    ],
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(loc)) }} />
      <main>
        <HeroSpace />
        <ResourcesCatalog />
      </main>
    </>
  )
}
