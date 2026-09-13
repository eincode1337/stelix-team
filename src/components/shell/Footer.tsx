'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useShell } from '@/components/shell/ShellProvider'
import { locales, localeMeta } from '@/i18n/config'
import { useT, useLocale } from '@/i18n/LocaleProvider'

const ft = (...n: string[]) => n.map((x) => `Footer-module__yg9ahW__${x}`).join(' ')
const dd = (...n: string[]) => n.map((x) => `Dropdown-module__DasDQW__${x}`).join(' ')
const sb = (...n: string[]) => n.map((x) => `SiteStatusBadge-module__ZqpvsG__${x}`).join(' ')

const PAYMENT_METHODS = ['mir', 'visa', 'mastercard', 'sber'] as const

export function Footer() {
  const year = new Date().getFullYear()

  const tr = useT()
  const shell = useShell()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const [langOpen, setLangOpen] = useState(false)
  const [statusResolved, setStatusResolved] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStatusResolved(true), 300)
    return () => clearTimeout(t)
  }, [])

  const switchLocale = useCallback(
    (loc: string) => {
      try {
        document.cookie = `NEXT_LOCALE=${loc};path=/;max-age=31536000;SameSite=Lax`
      } catch {}
      const stripped = pathname.replace(/^\/(ru|uk|en)(?=\/|$)/, '') || ''
      window.location.assign(`/${loc}${stripped}`)
    },
    [pathname],
  )

  return (
    <footer className={ft('footer')} data-site-footer="true">
      <section className={ft('container')} data-nosnippet="true">
        <div className={ft('footerInner')}>
          <div className={ft('top')}>
            <div className={ft('brand')}>
              <a href="https://ds.stelix.team" target="_blank" rel="noopener noreferrer" className={ft('discordButton')} title="Discord">
                <img alt="Discord" loading="lazy" width={24} height={24} decoding="async" data-nimg="1" className={ft('discordIcon')} style={{ color: 'transparent' }} src="/img/discord-logo.svg" />
              </a>
              <div className={ft('langSelectWrap')}>
                <div className={dd('dropdown')} style={{ position: 'relative' }}>
                  <button type="button" className={dd('trigger', 'triggerHasOptionIcon') + (langOpen ? ' ' + dd('triggerOpen') : '')} aria-expanded={langOpen} aria-haspopup="listbox" onClick={() => setLangOpen((v) => !v)}>
                    <span className={dd('triggerContent', 'triggerContentWithOptionIcon')}>
                      <span className={dd('triggerOptionIconWrap')} aria-hidden="true">
                        <img alt="" loading="lazy" width={20} height={20} decoding="async" data-nimg="1" className={dd('optionIcon')} style={{ color: 'transparent' }} src={localeMeta[currentLocale as 'ru' | 'uk' | 'en']?.flag ?? '/icons/flags/ru.svg'} />
                      </span>
                      <span className={dd('triggerLabelWithOptionIcon')}>{localeMeta[currentLocale as 'ru' | 'uk' | 'en']?.label ?? 'Русский'}</span>
                    </span>
                    <svg viewBox="0 0 24 24" fill="none" className={(langOpen ? dd('icon', 'iconOpenUp') : dd('icon')) + '  '} aria-hidden="true">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {langOpen && (
                    <div className={dd('menu', 'menuOpenUp')} role="listbox" aria-label={tr('Язык')}>
                      {locales.map((code) => (
                        <button
                          key={code}
                          type="button"
                          role="option"
                          aria-selected={code === currentLocale}
                          onClick={() => switchLocale(code)}
                          style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem 0.65rem', color: 'inherit', textAlign: 'start' }}
                        >
                          <span className={dd('optionMetaRow')}>
                            <span className={dd('optionLabelGroup')}>
                              <span className={dd('triggerOptionIconWrap')} aria-hidden="true">
                                <img alt="" loading="lazy" width={20} height={20} decoding="async" className={dd('optionIcon')} style={{ color: 'transparent' }} src={localeMeta[code].flag} />
                              </span>
                              <span className={dd('optionLabelText')}>{localeMeta[code].label}</span>
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <nav className={ft('links')} aria-label={tr('Правовые документы и контакты')}>
              <span className={ft('copyrightSupportType', 'linksSectionHeading')}>{tr('Документы')}</span>
              <Link className={ft('link')} href="/legal">{tr('Правовые документы')}</Link>
              <Link className={ft('link')} href="/offer">{tr('Публичная оферта')}</Link>
              <Link className={ft('link')} href="/refunds">{tr('Возвраты и споры')}</Link>
              <Link className={ft('link')} href="/payment-info">{tr('Оплата и доставка')}</Link>
              <Link className={ft('link')} href="/privacy">{tr('Конфиденциальность')}</Link>
              <button type="button" className={ft('contactsTrigger')} aria-haspopup="dialog" aria-label={tr('Контакты и реквизиты. Открыть окно')} aria-expanded="false" onClick={shell.openContacts}>{tr('Контакты / реквизиты')}</button>
            </nav>
          </div>

          <span className={ft('footerDivider')} aria-hidden="true" />

          <div className={ft('bottomBar')}>
            <div className={ft('bottomLeading')}>
              <Link className={ft('copyrightBrand')} aria-label="Stelix Team" href="/">
                <span className={ft('footerLogo')} aria-hidden="true">
                  <span className={ft('footerLogoIcons')}>
                    <span className={ft('footerLogoMutedLight')} />
                    <span className={ft('footerLogoMutedDark')} />
                    <span className={ft('footerLogoColorLight')} />
                    <span className={ft('footerLogoColorDark')} />
                  </span>
                </span>
              </Link>
              <span className={ft('bottomPills')}>
                {!statusResolved ? (
                  <p className={sb('badge', 'loading')} role="status" aria-busy="true" aria-label={tr('Проверка')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={sb('leadIcon', 'leadIconDot')} aria-hidden="true">
                      <path d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
                    </svg>
                    <span className={sb('label')}>{tr('Проверка')}</span>
                  </p>
                ) : (
                  <>
                    <p className={sb('badge')} role="status" aria-label={tr('Статус сайта: Онлайн, сервис в норме')}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={sb('leadIcon', 'leadIconDot')} aria-hidden="true">
                        <path d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
                      </svg>
                      <span className={sb('label')}>{tr('Онлайн')}</span>
                      <span className={sb('count')}>3</span>
                    </p>
                    <p className={sb('badge', 'rating')} role="status" aria-label={tr('Общая оценка 5.0 из 5')} data-tooltip-trigger="">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className={sb('leadIcon')} aria-hidden="true">
                        <path d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z" />
                      </svg>
                      <span className={sb('label')}>{tr('Рейтинг')}</span>
                      <span className={sb('count')}>5.0</span>
                    </p>
                  </>
                )}
              </span>
            </div>

            <div className={ft('copyrightCenter')}>
              <div className={ft('footerPaymentMethods')} aria-hidden="true">
                {PAYMENT_METHODS.map((m) => (
                  <span key={m} className={ft('footerPaymentMethodBadge')}>
                    <img alt="" width={78} height={50} decoding="async" data-nimg="1" className={ft('footerPaymentMethodIcon')} style={{ color: 'transparent' }} src={`/icons/payment-methods/${m}.svg`} />
                  </span>
                ))}
              </div>
              <span className={ft('copyrightSupportType', 'copyrightYear')}>{tr('Все права защищены')} © {year}</span>
            </div>

            <p className={ft('copyrightSupport')}>
              <span className={ft('copyrightSupportType', 'copyrightSupportPrefix')}>{tr('Отвечаем с 10:00 до 22:00 по МСК.')}</span>
              <a href="mailto:support@stelix.team" className={ft('copyrightSupportType', 'copyrightEmail')}>support@stelix.team</a>
            </p>
          </div>
        </div>
      </section>
    </footer>
  )
}
