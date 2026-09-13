import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { isLocale, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'

const li = (...n: string[]) => n.map((x) => `LegalDocumentsIndex-module__PHPmbq__${x}`).join(' ')
const hb = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')
const hs = (...n: string[]) => n.map((x) => `PageHeaderSearch-module__szXj0q__${x}`).join(' ')

const CARD_ROW_META =
  'AddResourceContent-module__UdTvSa__sellerLineBadges PurchasesListStackRow-module__TmWrnq__stackMeta ' + li('cardRowMeta')
const CARD_DATE_BADGE =
  'AddResourceContent-module__UdTvSa__sellerLineSoftBadge PurchasesListStackRow-module__TmWrnq__stackDateBadge ' +
  li('cardDateBadge')

const SITE = 'https://stelix.team'

type Card = { href: string; title: string; summary: string; date: string }
type Tier = { id: string; title: string; count: number; icon: ReactNode; cards: Card[] }

const EssentialIcon = (
  <svg viewBox="0 0 576 512" fill="currentColor" className={li('catalogTierHeaderIconSvg')}>
    <path d="M208 48L96 48c-8.8 0-16 7.2-16 16l0 384c0 8.8 7.2 16 16 16l80 0 0 48-80 0c-35.3 0-64-28.7-64-64L32 64C32 28.7 60.7 0 96 0L229.5 0c17 0 33.3 6.7 45.3 18.7L397.3 141.3c12 12 18.7 28.3 18.7 45.3l0 149.5-48 0 0-128-88 0c-39.8 0-72-32.2-72-72l0-88zM348.1 160L256 67.9 256 136c0 13.3 10.7 24 24 24l68.1 0zM240 380l32 0c28.7 0 52 23.3 52 52l0 64c0 28.7-23.3 52-52 52l-32 0c-11 0-20-9-20-20l0-128c0-11 9-20 20-20zm32 128c6.6 0 12-5.4 12-12l0-64c0-6.6-5.4-12-12-12l-12 0 0 88 12 0zM392 380l16 0c24.3 0 44 19.7 44 44l0 80c0 24.3-19.7 44-44 44l-16 0c-24.3 0-44-19.7-44-44l0-80c0-24.3 19.7-44 44-44zm-4 44l0 80c0 2.2 1.8 4 4 4l16 0c2.2 0 4-1.8 4-4l0-80c0-2.2-1.8-4-4-4l-16 0c-2.2 0-4 1.8-4 4zm88 0c0-24.3 19.7-44 44-44l16 0c24.3 0 44 19.7 44 44l0 8c0 11-9 20-20 20s-20-9-20-20l0-8c0-2.2-1.8-4-4-4l-16 0c-2.2 0-4 1.8-4 4l0 80c0 2.2 1.8 4 4 4l16 0c2.2 0 4-1.8 4-4l0-8c0-11 9-20 20-20s20 9 20 20l0 8c0 24.3-19.7 44-44 44l-16 0c-24.3 0-44-19.7-44-44l0-80z" />
  </svg>
)

const RulesIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={li('catalogTierHeaderIconSvg')}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const MoneyIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 576 512"
    fill="currentColor"
    className={li('catalogTierHeaderIconSvg')}
  >
    <path d="M408 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l52.5 0-140.3 120.3-112.4-98.3c-8.2-7.1-20.1-7.9-29.1-1.9L10.7 180c-11 7.4-14 22.3-6.7 33.3s22.3 14 33.3 6.7L190 118.2 304.2 218.1c9 7.9 22.4 7.9 31.4 .2L496 80.8 496 136c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24L408 0zM192 224c-13.3 0-24 10.7-24 24l0 208c0 13.3 10.7 24 24 24s24-10.7 24-24l0-208c0-13.3-10.7-24-24-24zM56 320c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zM432 544a144 144 0 1 0 0-288 144 144 0 1 0 0 288zm0-240c8.8 0 16 7.2 16 16l0 8 16 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-45.8 0c-5.6 0-10.2 4.6-10.2 10.2 0 4.9 3.5 9.1 8.3 10l45 8.2c20 3.6 34.6 21.1 34.6 41.5 0 23.3-18.9 42.2-42.2 42.2l-5.8 0 0 8c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-8-16 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l53.8 0c5.6 0 10.2-4.6 10.2-10.2 0-4.9-3.5-9.1-8.3-10l-45-8.2c-20-3.6-34.6-21.1-34.6-41.5 0-22.6 17.7-41 40-42.1l0-8.1c0-8.8 7.2-16 16-16z" />
  </svg>
)

const ReferenceIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    className={li('catalogTierHeaderIconSvg')}
  >
    <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM216 336c-13.3 0-24 10.7-24 24s10.7 24 24 24l80 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-8 0 0-88c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l24 0 0 64-24 0zm40-144a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
  </svg>
)

const TIERS: Tier[] = [
  {
    id: 'legal-tier-essential',
    title: 'Основные',
    count: 3,
    icon: EssentialIcon,
    cards: [
      {
        href: '/offer',
        title: 'Публичная оферта',
        summary: 'Договор с пользователем и автором: доступ, лицензии, заказы, расчёты.',
        date: '4 сентября 2026 г.',
      },
      {
        href: '/terms',
        title: 'Условия площадки',
        summary: 'Правила использования платформы: аккаунты, ресурсы, заказы и споры.',
        date: '4 сентября 2026 г.',
      },
      {
        href: '/privacy',
        title: 'Политика конфиденциальности',
        summary: 'Персональные данные: сбор, обработка и защита.',
        date: '8 сентября 2026 г.',
      },
    ],
  },
  {
    id: 'legal-tier-rules',
    title: 'Правила и контент',
    count: 7,
    icon: RulesIcon,
    cards: [
      {
        href: '/platform-rules',
        title: 'Правила площадки',
        summary: 'Таблица типичных нарушений и мер ответственности; дополняет Условия площадки и оферту.',
        date: '4 июня 2026 г.',
      },
      {
        href: '/content-policy',
        title: 'Политика контента и ресурсов',
        summary: 'Размещение ресурсов, модерация и ответственность автора.',
        date: '4 июня 2026 г.',
      },
      {
        href: '/ip-protection-policy',
        title: 'Политика защиты интеллектуальной собственности',
        summary: 'Порядок обращений о нарушении прав, гарантии продавца, рассмотрение жалоб и решения Площадки.',
        date: '4 июня 2026 г.',
      },
      {
        href: '/licensing-policy',
        title: 'Политика лицензирования контента',
        summary: 'Виды лицензий, права покупателя, запреты; автор сохраняет права на контент.',
        date: '4 июня 2026 г.',
      },
      {
        href: '/author-agreement',
        title: 'Соглашение с автором',
        summary: 'Автор — независимое лицо; ответственность за контент; выплаты и право удаления.',
        date: '4 сентября 2026 г.',
      },
      {
        href: '/statuses-policy',
        title: 'Политика статусов и доступа',
        summary: 'Статусы и доступ; числовые пороги — в Условиях, раздел 10.',
        date: '4 июня 2026 г.',
      },
      {
        href: '/offplatform-policy',
        title: 'Политика офф-платформенных сделок',
        summary: 'Увод сделок с Площадки: запрет, доказательства, санкции.',
        date: '4 июня 2026 г.',
      },
    ],
  },
  {
    id: 'legal-tier-money',
    title: 'Финансы',
    count: 7,
    icon: MoneyIcon,
    cards: [
      {
        href: '/payments-policy',
        title: 'Политика расчётов',
        summary: 'Комиссия, резервирование и учёт сумм авторов; дополняет оферту.',
        date: '4 июня 2026 г.',
      },
      {
        href: '/agency-model',
        title: 'Политика агентской модели расчётов',
        summary: 'Приём через ПС, учёт автору и комиссия; оборот по сделкам не равен выручке Площадки.',
        date: '4 июня 2026 г.',
      },
      {
        href: '/refunds',
        title: 'Политика возвратов и споров',
        summary: 'Возвраты, споры по заказам и последствия чарджбеков.',
        date: '4 июня 2026 г.',
      },
      {
        href: '/orders-escrow-policy',
        title: 'Политика Escrow и безопасных сделок',
        summary:
          'Порядок резервирования средств, безопасных расчётов, исполнения заказов, споров и перечислений между пользователями.',
        date: '4 июня 2026 г.',
      },
      {
        href: '/aml-policy',
        title: 'AML и антифрод политика',
        summary: 'Заморозка, мониторинг, верификация, чарджбеки, запросы банков и ПС.',
        date: '4 июня 2026 г.',
      },
      {
        href: '/aml-kyc-policy',
        title: 'AML/KYC и санкционная политика',
        summary: 'KYC, мониторинг операций, заморозка выплат, санкционные ограничения и последствия нарушений.',
        date: '4 июня 2026 г.',
      },
      {
        href: '/currency-policy',
        title: 'Политика использования «молний»',
        summary: 'Учёт в интерфейсе; не деньги и не выплата как у платёжной организации.',
        date: '4 июня 2026 г.',
      },
    ],
  },
  {
    id: 'legal-tier-reference',
    title: 'Краткая справка',
    count: 1,
    icon: ReferenceIcon,
    cards: [
      {
        href: '/role-policy',
        title: 'Суть роли Площадки',
        summary: 'Площадка — оператор сервиса, не продавец продуктов авторов.',
        date: '4 июня 2026 г.',
      },
    ],
  },
]

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  return {
    title: t(loc, 'Правовые документы — Stelix Team'),
    description: t(
      loc,
      'Каталог правовых документов Stelix Team: условия, правила, оферта, расчёты, авторы, возвраты и политики.',
    ),
    alternates: {
      canonical: `/${loc}/legal`,
      languages: {
        ru: '/ru/legal',
        uk: '/uk/legal',
        en: '/en/legal',
        'x-default': `${SITE}/legal`,
      },
    },
  }
}

export default async function LegalDocumentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  return (
    <main>
      <section className={li('section', 'sectionFlex')}>
        <div className={'container ' + li('container')}>
          <div className={li('catalogRoot')}>
            <header className={hb('headerBar')}>
              <div className={hb('headerBar__start')}>
                <h1 className={hb('headerBar__title')}>{t(loc, 'Правовые документы')}</h1>
                <span className={hb('headerBar__count')} aria-label={t(loc, 'Документов: 18')}>
                  18
                </span>
              </div>
              <div className={hb('headerBar__end')}>
                <span className={hb('headerBar__divider')} aria-hidden="true" />
                <div className={hb('headerBar__actions')}>
                  <div className={hs('root')}>
                    <button
                      type="button"
                      className={hs('toggle')}
                      aria-label={t(loc, 'Поиск по тексту документа')}
                      data-tooltip-trigger=""
                    >
                      <svg viewBox="0 0 24 24" fill="none" className={hs('toggleIcon')} aria-hidden="true">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {TIERS.map((tier) => (
              <section key={tier.id} className={li('catalogTier')} aria-labelledby={tier.id}>
                <div className={li('catalogTierHeader')}>
                  <span className={li('catalogTierRail')} aria-hidden="true" />
                  <div className={li('catalogTierHeaderIcon')} aria-hidden="true">
                    {tier.icon}
                  </div>
                  <h2 id={tier.id} className={hb('headerBar__title') + ' ' + li('catalogTierTitle')}>
                    {t(loc, tier.title)}
                  </h2>
                  <span
                    className={hb('headerBar__count') + ' ' + li('catalogTierHeaderCount')}
                    aria-label={t(loc, `Документов в разделе: ${tier.count}`)}
                  >
                    {tier.count}
                  </span>
                </div>
                <div className={li('cards')}>
                  {tier.cards.map((card) => (
                    <Link key={card.href} className={li('card')} href={card.href}>
                      <div className={li('cardMain')}>
                        <div className={li('cardCenter')}>
                          <h3 className={li('cardTitle')}>{t(loc, card.title)}</h3>
                          <p className={li('cardSummary')}>{t(loc, card.summary)}</p>
                        </div>
                        <div className={li('cardRight')}>
                          <div className={CARD_ROW_META}>
                            <span className={CARD_DATE_BADGE}>{t(loc, card.date)}</span>
                            <svg viewBox="0 0 24 24" fill="none" className={li('cardChevron')} aria-hidden="true">
                              <path
                                d="M9 6l6 6-6 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
