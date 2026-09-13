import type { ReactNode } from 'react'
import { t } from '@/i18n/t'
import type { Locale } from '@/i18n/config'
import { DocumentSearch } from './DocumentSearch'

export const ld = (...n: string[]) => n.map((x) => `LegalDocumentContent-module__rYWUeW__${x}`).join(' ')
const hb = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')

export function DocumentLayout({
  title,
  subtitle,
  updatedDate,
  version,
  locale = 'ru',
  children,
}: {
  title: string
  subtitle: string
  updatedDate: string
  version: string
  locale?: Locale
  children: ReactNode
}) {
  const localizedDate = locale === 'en' ? updatedDate.replace(/\./g, '/') : updatedDate
  const stamp = `${localizedDate} (v${version})`
  return (
    <main>
      <section className="container">
        <section className={ld('page')}>
          <section className={ld('container')}>
            <header className={hb('headerBar')}>
              <div className={hb('headerBar__start')}>
                <h1 className={hb('headerBar__title')}>{t(locale, title)}</h1>
              </div>
              <div className={hb('headerBar__end')}>
                <span className={hb('headerBar__divider')} aria-hidden="true" />
                <div className={hb('headerBar__actions')}>
                  <DocumentSearch locale={locale} />
                </div>
              </div>
            </header>
            <p className={ld('subtitle')}>{t(locale, subtitle)}</p>
            <div className={ld('articleSurface')}>
              {children}
              <header
                className={hb('headerBar', 'headerBar_embedded', 'headerBar_reverse')}
                aria-label={`${t(locale, 'Последнее изменение')} ${stamp}`}
              >
                <div className={hb('headerBar__start')}>
                  <h3 className={hb('headerBar__title', 'headerBar__titleLevel3')}>{t(locale, 'Последнее изменение')}</h3>
                  <span className={hb('headerBar__text')}>{stamp}</span>
                </div>
                <div className={hb('headerBar__end')}>
                  <span className={hb('headerBar__divider')} aria-hidden="true" />
                  <div className={hb('headerBar__actions')} />
                </div>
              </header>
            </div>
          </section>
        </section>
      </section>
    </main>
  )
}

export function DocSection({ id, children }: { id: string; children: ReactNode }) {
  return (
    <header className={hb('headerBar', 'headerBar_embedded') + ' ' + ld('docSectionBar')}>
      <div className={hb('headerBar__start')}>
        <h2 className={hb('headerBar__title', 'headerBar__titleLevel2') + ' ' + ld('docSectionTitle')} id={id}>
          {children}
        </h2>
      </div>
      <div className={hb('headerBar__end')}>
        <span className={hb('headerBar__divider')} aria-hidden="true" />
        <div className={hb('headerBar__actions')} />
      </div>
    </header>
  )
}

export function Clause({ children }: { children: ReactNode }) {
  return (
    <span className={ld('clauseIndex')} data-legal-clause-index="">
      {children}
    </span>
  )
}
