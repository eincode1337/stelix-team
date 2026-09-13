import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { t } from '@/i18n/t'
import { SellerApplyClient } from './SellerApplyClient'

const cr = (...n: string[]) => n.map((v) => `CreateResourceContent-module__b5R2iG__${v}`).join(' ')

const revealDelay = (ms: string): CSSProperties => ({ ['--reveal-delay']: ms }) as CSSProperties

type PlatformItem = { start: boolean; delay: string | null; icon: ReactNode; title: string; text: string }

const PLATFORM_INFO: PlatformItem[] = [
  {
    start: true,
    delay: null,
    icon: (
      <span className={cr('heroPlatformInfoLogo')}>
        <img alt="" loading="lazy" width={36} height={36} decoding="async" className={cr('heroPlatformInfoLogoLight')} style={{ color: 'transparent' }} src="/icons/logo_light_bk.svg" />
        <img alt="" loading="lazy" width={36} height={36} decoding="async" className={cr('heroPlatformInfoLogoDark')} style={{ color: 'transparent' }} src="/icons/logo_dark_bk.svg" />
      </span>
    ),
    title: 'Площадка Stelix Team',
    text: 'Каталог цифровых ресурсов, биржа заказов и инструменты для сделок между пользователями. Площадка не продаёт товары от своего имени — стороной сделки остаётесь вы.',
  },
  {
    start: false,
    delay: '85ms',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={cr('heroPlatformInfoIconSvg')}>
        <path d="M200.3 81.5C210.9 61.5 231.9 48 256 48s45.1 13.5 55.7 33.5c5.4 10.2 17.2 15.1 28.2 11.7 21.6-6.6 46.1-1.4 63.1 15.7s22.3 41.5 15.7 63.1c-3.4 11 1.5 22.9 11.7 28.2 20 10.6 33.5 31.6 33.5 55.7s-13.5 45.1-33.5 55.7c-10.2 5.4-15.1 17.2-11.7 28.2 6.6 21.6 1.4 46.1-15.7 63.1s-41.5 22.3-63.1 15.7c-11-3.4-22.9 1.5-28.2 11.7-10.6 20-31.6 33.5-55.7 33.5s-45.1-13.5-55.7-33.5c-5.4-10.2-17.2-15.1-28.2-11.7-21.6 6.6-46.1 1.4-63.1-15.7S86.6 361.6 93.2 340c3.4-11-1.5-22.9-11.7-28.2-20-10.6-33.5-31.6-33.5-55.7s13.5-45.1 33.5-55.7c10.2-5.4 15.1-17.2 11.7-28.2-6.6-21.6-1.4-46.1 15.7-63.1S150.4 86.6 172 93.2c11 3.4 22.9-1.5 28.2-11.7zM256 0c-35.9 0-67.8 17-88.1 43.4-33-4.3-67.6 6.2-93 31.6s-35.9 60-31.6 93C17 188.2 0 220.1 0 256s17 67.8 43.4 88.1c-4.3 33 6.2 67.6 31.6 93s60 35.9 93 31.6C188.2 495 220.1 512 256 512s67.8-17 88.1-43.4c33 4.3 67.6-6.2 93-31.6s35.9-60 31.6-93C495 323.8 512 291.9 512 256s-17-67.8-43.4-88.1c4.3-33-6.2-67.6-31.6-93s-60-35.9-93-31.6C323.8 17 291.9 0 256 0zm4 144c-11 0-20 9-20 20l0 4c-28.8 .3-52 23.7-52 52.5 0 25.7 18.5 47.6 43.9 51.8l41.7 7c6 1 10.4 6.2 10.4 12.3 0 6.9-5.6 12.5-12.5 12.5L216 304c-11 0-20 9-20 20s9 20 20 20l24 0 0 4c0 11 9 20 20 20s20-9 20-20l0-4.7c25-4.1 44-25.7 44-51.8 0-25.7-18.5-47.6-43.9-51.8l-41.7-7c-6-1-10.4-6.2-10.4-12.3 0-6.9 5.6-12.5 12.5-12.5l47.5 0c11 0 20-9 20-20s-9-20-20-20l-8 0 0-4c0-11-9-20-20-20z" />
      </svg>
    ),
    title: 'Более 2 лет работы',
    text: 'Stelix Team развивается уже более двух лет: здесь публикуют моды, плагины и сборки, находят покупателей и исполнителей, оформляют лицензии и безопасные сделки в одном сервисе.',
  },
  {
    start: true,
    delay: '170ms',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cr('heroPlatformInfoIconSvg')}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: 'Безопасные расчёты',
    text: 'Площадка организует приём платежей, escrow, рассмотрение споров и выплаты продавцам как агент пользователей. Покупатель получает ресурс сразу после оплаты.',
  },
  {
    start: false,
    delay: '255ms',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={cr('heroPlatformInfoIconSvg')}>
        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Развиваем каждый день',
    text: 'Команда регулярно выпускает обновления: каталог, кабинет продавца, платежи, чат и модерация. Исправляем ошибки и добавляем функции — площадка не стоит на месте.',
  },
  {
    start: true,
    delay: '340ms',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={cr('heroPlatformInfoIconSvg')}>
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Слушаем продавцов и покупателей',
    text: 'Обратная связь через поддержку, тикеты и чат учитывается в доработках. Предложения по удобству продаж, выплат и покупок помогают выбирать приоритеты разработки.',
  },
  {
    start: false,
    delay: '425ms',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cr('heroPlatformInfoIconSvg')}>
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
      </svg>
    ),
    title: 'Автовыдача',
    text: 'После оплаты покупатель сразу получает доступ к ресурсу или лицензии — без ручной переписки. Вы настраиваете файлы и условия один раз при публикации.',
  },
]

const STATS: string[] = ['активных продавцов', 'покупателей на площадке', 'успешных сделок']

const HIGHLIGHT_PATH =
  'M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 12 32 L 52 32 L 32 32 L 32 12 L 32 52 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16'

const HIGHLIGHTS: string[] = [
  '3% с каждой продажи (Продавец), 1% (Продавец+) — после 100 успешных продаж',
  'Заявку проверяем в течение 24 часов, каждый ресурс проходит модерацию перед каталогом',
  'Публикация через панель продавца: описание, цена, файлы или ссылки для выдачи',
  'Официальные продажи: чек по 54-ФЗ покупателю при оплате; налоги и условия платёжных сервисов',
  'Вывод на СБП, карту, ЮMoney или криптокошелёк — заявка в кабинете, от 1 часа до 7 дней',
]

type ProcessStep = { maskId: string; title: string; text: string }

const PROCESS_STEPS: ProcessStep[] = [
  { maskId: '_R_japbsnpf9h9tb_', title: 'Подайте заявку', text: 'Заполните форму с информацией о себе и минимум 3 проекта из портфолио' },
  { maskId: '_R_lapbsnpf9h9tb_', title: 'Получите одобрение', text: 'Проверим заявку в течение 24 часов — после одобрения откроется панель продавца' },
  { maskId: '_R_napbsnpf9h9tb_', title: 'Загрузите ресурсы', text: 'Создайте ресурс: описание, цена, файлы или ссылки для автоматической выдачи' },
  { maskId: '_R_papbsnpf9h9tb_', title: 'Получайте доход', text: 'С продажи вы получите средства для выплаты на СБП, карту, ЮMoney или криптокошелёк' },
]

export type SellerFaq = { q: string; a: string; delay: string }

export const SELLER_FAQ: SellerFaq[] = [
  {
    q: 'Где продавать свои IT-разработки онлайн?',
    a: 'На Stelix Team — площадке, где разработчики продают плагины, моды, скрипты, шаблоны и другие цифровые продукты. Можно выставить готовую разработку в каталог и брать заказы на бирже — без своего магазина и платёжной интеграции. Подайте заявку, после проверки откроется панель продавца.',
    delay: '85ms',
  },
  {
    q: 'Можно ли бесплатно продавать плагины и скрипты?',
    a: 'Да, подать заявку и публиковать разработки бесплатно. Площадка берёт комиссию только с успешных продаж: 3% для «Продавец» и 1% для «Продавец+» (после 100 продаж). При выводе отдельная комиссия по способу. Покрывает расходы платёжных систем, не связана с комиссией с продажи.',
    delay: '170ms',
  },
  {
    q: 'Как стать продавцом и монетизировать код?',
    a: 'Подайте заявку: опыт разработки от 1 года, портфолио из минимум 3 проектов, описание деятельности и контакт. Команды и NDA-проекты — укажите доступные ссылки и поясните в описании. После одобрения можно публиковать разработки и получать оплату с каждой продажи.',
    delay: '255ms',
  },
  {
    q: 'Какие IT-продукты можно продавать на площадке?',
    a: 'Плагины, моды, сборки, скрипты, шаблоны, карты, лицензии и связанные IT-услуги. Каждая разработка проходит модерацию — не принимаем контент, нарушающий права третьих лиц или закон.',
    delay: '340ms',
  },
  {
    q: 'Как быстро можно начать продавать?',
    a: 'Заявку проверяют в течение 1 рабочего дня. После одобрения откроется панель продавца, можно публиковать разработки. Каждая карточка проходит модерацию перед продажей.',
    delay: '425ms',
  },
  {
    q: 'Какая комиссия при продаже цифровых продуктов?',
    a: 'Стартовый тариф «Продавец» — 3% с продажи. После 100 успешных продаж «Продавец+» снижает комиссию до 1%. Удерживается только с суммы продажи, не с вывода заработка.',
    delay: '510ms',
  },
  {
    q: 'Как выложить и продать свою разработку в каталог?',
    a: 'В панели продавца создайте карточку: название, описание, цена, скриншоты, файлы или ссылки для автовыдачи покупателю. После модерации разработка появится в каталоге и станет доступна для покупки.',
    delay: '595ms',
  },
  {
    q: 'Как вывести деньги за проданные разработки?',
    a: 'Создайте заявку на выплату в личном кабинете. Доступны СБП, банковская карта, ЮMoney, криптокошелёк или баланс для покупок. Срок — от 1 часа до 7 дней.',
    delay: '680ms',
  },
]

export function CreateResourceContent({ locale }: { locale: string }) {
  return (
    <section className={cr('presentation')}>
      <div className={cr('container')}>
        <div className={cr('heroSplit')}>
          <div className={cr('heroCopy', 'revealLeft')}>
            <h1 className={cr('heroTitle')}>
              {t(locale, 'Зарабатывайте')}<span className={cr('heroTitleAccent')}>{t(locale, 'на своих разработках')}</span>
            </h1>
            <div className={cr('heroLead')}>
              <p className={cr('heroSubtitle')}>{t(locale, 'Продавайте IT цифровые ресурсы в каталоге и берите заказы на бирже. Подайте заявку, после проверки откроется панель продавца.')}</p>
              <div className={cr('heroLeadActions')}>
                <button type="button" className={cr('ctaButton', 'ctaButtonHero')} aria-disabled="false">{t(locale, 'Подать заявку на продавца')}</button>
                <Link className={cr('secondaryActionLink', 'heroDemoEditorLink')} href="/seller/application/demo-editor">{t(locale, 'Демо-редактор')}</Link>
              </div>
            </div>
          </div>
          <div style={revealDelay('120ms')} className={cr('heroVisual', 'revealUp')} aria-hidden="true">
            <div className={cr('heroVisualShell')}>
              <img alt="" width={512} height={512} decoding="async" className={cr('heroImage')} style={{ color: 'transparent' }} src="/icons/start_seller.svg" />
            </div>
          </div>
        </div>

        <div className={cr('heroPlatformInfo')}>
          {PLATFORM_INFO.map((item, i) => (
            <article
              key={i}
              style={item.delay ? revealDelay(item.delay) : undefined}
              className={cr('heroPlatformInfoItem', item.start ? 'heroPlatformInfoItemStart' : 'heroPlatformInfoItemShifted', item.start ? 'revealLeft' : 'revealRight')}
            >
              <div className={cr('heroPlatformInfoItemInner')}>
                <span className={cr('heroPlatformInfoRail')} aria-hidden="true"></span>
                <div className={cr('heroPlatformInfoIcon')} aria-hidden="true">{item.icon}</div>
                <div className={cr('heroPlatformInfoContent')}>
                  <h2 className={cr('heroPlatformInfoTitle')}>{t(locale, item.title)}</h2>
                  <p className={cr('heroPlatformInfoText')}>{t(locale, item.text)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={cr('heroStats', 'revealUp')}>
          {STATS.map((label, i) => (
            <div key={i} className={cr('heroStat')}>
              <p className={cr('heroStatValue')}>0+</p>
              <p className={cr('heroStatLabel')}>{t(locale, label)}</p>
            </div>
          ))}
        </div>

        <ul className={cr('heroHighlights', 'revealUp')}>
          {HIGHLIGHTS.map((text, i) => (
            <li key={i} className={cr('heroHighlight')}>
              <svg viewBox="0 0 64 64" aria-hidden="true" className={cr('heroHighlightMark')}>
                <path d={HIGHLIGHT_PATH} pathLength="672.7116088867188" className={cr('heroHighlightMarkPath')}></path>
              </svg>
              <span className={cr('heroHighlightText')}>{t(locale, text)}</span>
            </li>
          ))}
        </ul>

        <section className={cr('processFlow', 'revealUp')} aria-labelledby="seller-process-heading">
          <p id="seller-process-heading" className={cr('sellerSectionHeading')}>{t(locale, 'Как начать зарабатывать?')}</p>
          <ol className={cr('processFlowTrack')}>
            {PROCESS_STEPS.map((step, i) => (
              <li key={i} className={cr('processFlowStep')}>
                <span className={cr('processFlowStepNumber')}>
                  <svg viewBox="0 0 42 42" aria-hidden="true" className={cr('processFlowStepNumberRing')}>
                    <defs>
                      <mask id={step.maskId}>
                        <circle cx="21" cy="21" r="19" pathLength="100" className={cr('processFlowStepNumberRingMaskPath')}></circle>
                      </mask>
                    </defs>
                    <circle cx="21" cy="21" r="19" pathLength="100" mask={`url(#${step.maskId})`} className={cr('processFlowStepNumberRingPath')}></circle>
                  </svg>
                  <span className={cr('processFlowStepNumberLabel')}>{i + 1}</span>
                </span>
                <div className={cr('processFlowStepBody')}>
                  <h3 className={cr('processFlowStepTitle')}>{t(locale, step.title)}</h3>
                  <p className={cr('processFlowStepText')}>{t(locale, step.text)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={cr('bottomCta', 'revealUp')} aria-labelledby="seller-bottom-cta-heading">
          <div className={cr('bottomCtaCopy')}>
            <h2 id="seller-bottom-cta-heading" className={cr('bottomCtaTitle')}>{t(locale, 'Всё легко и просто!')}</h2>
            <p className={cr('bottomCtaText')}>{t(locale, 'Подача заявки не отнимет у вас много времени.')}</p>
          </div>
          <div className={cr('bottomCtaActions')}>
            <Link className={cr('secondaryActionLink', 'bottomCtaSupportLink')} href="/chat?tab=support&supportCompose=1&supportReason=other_problem">{t(locale, 'Задать вопрос')}</Link>
            <button type="button" className={cr('ctaButton', 'ctaButtonHero')} aria-disabled="false">{t(locale, 'Подать заявку')}</button>
          </div>
        </section>

        <section className={cr('sellerFaq')} aria-labelledby="seller-faq-heading">
          <div className={cr('sellerFaqHeader', 'revealUp')}>
            <p className={cr('sellerFaqBadge')}>FAQ</p>
            <p id="seller-faq-heading" className={cr('sellerSectionHeading')}>{t(locale, 'Частые вопросы')}</p>
            <p className={cr('sellerFaqSubtitle')}>{t(locale, 'Простым языком обо всём, что нужно знать о продаже на Stelix Team')}</p>
          </div>
          <div className={cr('sellerFaqList')}>
            {SELLER_FAQ.map((item, i) => (
              <details key={i} className={cr('sellerFaqItem') + '  ' + cr('revealUp')} style={revealDelay(item.delay)}>
                <summary className={cr('sellerFaqQuestion')} style={{ pointerEvents: 'none' }}>
                  <span className={cr('sellerFaqQuestionText')}>{t(locale, item.q)}</span>
                  <svg viewBox="0 0 24 24" fill="none" className={cr('sellerFaqChevron')} aria-hidden="true">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </summary>
                <div className={cr('sellerFaqAnswerPanel')} style={{ height: '0px' }}>
                  <div className={cr('sellerFaqAnswer')}>
                    <p>{t(locale, item.a)}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        <SellerApplyClient />
      </div>
    </section>
  )
}
