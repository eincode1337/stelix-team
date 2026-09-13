'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useT } from '@/i18n/LocaleProvider'

const cm = (...names: string[]) => names.map((n) => `FooterContactsModal-module__qfxbya__${n}`).join(' ')

const TITLE_ID = 'footer-contacts-modal-title'

type ContactsModalProps = {
  open: boolean
  onClose: () => void
}

export function ContactsModal({ open, onClose }: ContactsModalProps) {
  const [mounted, setMounted] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)
  const tr = useT()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!mounted || !open) return null

  const dialog = (
    <div
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'color-mix(in srgb, var(--fg-default, #000) 45%, transparent)',
      }}
    >
      <div
        ref={shellRef}
        className={cm('shell')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        style={{
          background: 'var(--bg-default)',
          border: '1px solid var(--border-muted)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
          boxShadow: '0 24px 60px rgba(0,0,0,.35)',
          maxHeight: 'calc(100dvh - 2rem)',
          overflowY: 'auto',
        }}
      >
        <div className={cm('inner')}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <div className={cm('headerLeft')}>
              <h2 id={TITLE_ID} className={cm('title')}>
                {tr('Контакты и реквизиты')}
              </h2>
            </div>
            <div className={cm('headerEnd')}>
              <button type="button" className={cm('close')} aria-label={tr('Закрыть')} onClick={onClose}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className={cm('closeIcon')}
                  aria-hidden="true"
                >
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className={cm('body')}>
            <section className={cm('infoSection')}>
              <div className={cm('sectionHeader')}>
                <span className={cm('sectionRail')} aria-hidden="true" />
                <span className={cm('sectionHeaderIcon')} aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    fill="currentColor"
                    className={cm('sectionHeaderIconSvg')}
                  >
                    <path d="M64 112c-8.8 0-16 7.2-16 16l0 22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1l0-22.1c0-8.8-7.2-16-16-16L64 112zM48 212.2L48 384c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-171.8L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128z" />
                  </svg>
                </span>
                <h3 className={cm('sectionTitle')}>{tr('Каналы связи')}</h3>
              </div>
              <div className={cm('sectionBody')}>
                <div className={cm('channelList')}>
                  <div className={cm('infoRow')}>
                    <span className={cm('infoLabel')}>{tr('Поддержка')}</span>
                    <span className={cm('infoValue')}>
                      <a className={cm('fieldLink')} href="mailto:support@stelix.team">
                        support@stelix.team
                      </a>
                    </span>
                  </div>
                  <div className={cm('infoRow')}>
                    <span className={cm('infoLabel')}>{tr('Правовые вопросы')}</span>
                    <span className={cm('infoValue')}>
                      <a className={cm('fieldLink')} href="mailto:legal@stelix.team">
                        legal@stelix.team
                      </a>
                    </span>
                  </div>
                  <div className={cm('infoRow')}>
                    <span className={cm('infoLabel')}>Discord</span>
                    <span className={cm('infoValue')}>
                      <a
                        className={cm('fieldLink')}
                        href="https://ds.stelix.team"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ds.stelix.team
                      </a>
                    </span>
                  </div>
                  <div className={cm('infoRow')}>
                    <span className={cm('infoLabel')}>{tr('Время ответа')}</span>
                    <span className={cm('infoValue')}>{tr('с 10:00 до 22:00 по МСК')}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className={cm('infoSection')}>
              <div className={cm('sectionHeader')}>
                <span className={cm('sectionRail')} aria-hidden="true" />
                <span className={cm('sectionHeaderIcon')} aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    fill="currentColor"
                    className={cm('sectionHeaderIconSvg')}
                  >
                    <path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM112 256l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
                  </svg>
                </span>
                <h3 className={cm('sectionTitle')}>{tr('Реквизиты исполнителя')}</h3>
              </div>
              <div className={cm('sectionBody')}>
                <div className={cm('infoGrid')}>
                  <div className={cm('infoRow')}>
                    <span className={cm('infoLabel')}>{tr('Исполнитель')}</span>
                    <span className={cm('infoValue')}>
                      <span className={cm('executorNameBlock')}>
                        <span>{tr('Индивидуальный предприниматель')}</span>
                        <span>{tr('EIN')}</span>
                      </span>
                    </span>
                  </div>
                  <div className={cm('infoRow')}>
                    <span className={cm('infoLabel')}>{tr('ИНН')}</span>
                    <span className={cm('infoValue', 'monoValue')}>000000000000</span>
                  </div>
                  <div className={cm('infoRow')}>
                    <span className={cm('infoLabel')}>{tr('ОГРНИП')}</span>
                    <span className={cm('infoValue', 'monoValue')}>000000000000000</span>
                  </div>
                  <div className={cm('infoRow')}>
                    <span className={cm('infoLabel')}>{tr('Налоговый режим')}</span>
                    <span className={cm('infoValue')}>{tr('УСН, объект «доходы»')}</span>
                  </div>
                  <div className={cm('infoRow')}>
                    <span className={cm('infoLabel')}>{tr('Электронная почта')}</span>
                    <span className={cm('infoValue')}>
                      <a className={cm('fieldLink')} href="mailto:legal@stelix.team">
                        legal@stelix.team
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
